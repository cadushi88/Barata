import { getSql, type Sql } from "@/lib/db";
import { storeScrapers } from "./index";
import { bestMatch, buildMatchIndex, type MatchCandidate } from "./match";
import { MAX_PRICE_XCG } from "@/lib/server/catalog";

export type ScrapeRunSummary = {
  runId: number;
  stores: { chainId: string; storeCount: number; itemsFound: number; status: "success" | "error"; error?: string }[];
  totalStaged: number;
  autoApproved: number;
};

/**
 * Publishes the safe subset of this run's freshly staged rows straight to
 * the live `prices` table, so the daily cron actually keeps prices fresh
 * instead of only ever piling rows into a review queue nobody's guaranteed
 * to work through. "Safe" is deliberately narrow, mirroring the admin
 * dashboard's own approve logic (scrape-review.ts) plus one extra guard:
 *
 *  1. match_confidence >= 1 — an EXACT (case/accent-insensitive) name match
 *     against an existing catalog product (see match.ts's scoreCandidate:
 *     confidence 1 only happens when the normalized names are equal, never
 *     a fuzzy/substring/word-overlap score). This is what kept migration
 *     0040's case-lot mismatches ("Hardon Black tea 25pc (12 pieces)"
 *     scored 0.73-0.81, never 1) out of harm's way — the same floor here.
 *  2. Already bounds-checked at staging time (0 < price <= MAX_PRICE_XCG),
 *     re-checked here too for defense in depth.
 *  3. NEW: the price can't be a wild outlier against that exact product's
 *     own most recent price at that same store — outside roughly a 3x band
 *     either way, it's left pending instead of auto-published. A genuine
 *     sale or markup rarely moves a grocery price 3x; a scraper misparse
 *     (a decimal shift, a unit mix-up, a stray "you save" figure that
 *     slipped past the bounds check) often does. A product with no prior
 *     price at this store (first observation ever) has nothing to compare
 *     against and is treated as safe, same as before this guard existed.
 *
 * Everything else — fuzzy matches, no match at all, or a sane-bounds-but-
 * outlier price — stays pending for a human reviewer exactly as before.
 */
async function autoApproveExactMatches(sql: Sql, runId: number): Promise<number> {
  const rows = await sql<{ n: number }>`
    with candidates as (
      select
        sp.id, sp.store_id, sp.matched_product_id, sp.raw_price, sp.source, sp.user_id, sp.observed_at,
        (
          select pr.amount from prices pr
          where pr.product_id = sp.matched_product_id and pr.store_id = sp.store_id
          order by pr.observed_at desc, pr.id desc
          limit 1
        ) as last_amount
      from scraped_prices sp
      where sp.run_id = ${runId} and sp.status = 'pending' and sp.matched_product_id is not null
        and sp.match_confidence >= 1 and sp.raw_price > 0 and sp.raw_price <= ${MAX_PRICE_XCG}
    ),
    safe_ids as (
      select id from candidates
      where last_amount is null or (raw_price >= last_amount * 0.34 and raw_price <= last_amount * 3)
    ),
    claimed as (
      update scraped_prices set status = 'approved', reviewed_at = now()
      where id in (select id from safe_ids)
      returning store_id, matched_product_id, raw_price, source, user_id, observed_at
    ),
    inserted as (
      insert into prices (product_id, store_id, amount, source, user_id, observed_at)
      select matched_product_id, store_id, raw_price, source, user_id, coalesce(observed_at, now())
      from claimed
      returning 1
    )
    select count(*)::int as n from inserted
  `;
  return rows[0]?.n ?? 0;
}

/**
 * Runs every store scraper, matches each item against the current catalog,
 * and stages the results in `scraped_prices` — never writes to the live
 * `prices` table. Safe to call from a cron endpoint or by hand; one store's
 * failure never aborts the others (see the per-scraper try/catch below).
 */
export async function runScrapeAndStage(triggeredBy: "cron" | "manual"): Promise<ScrapeRunSummary> {
  const sql = await getSql();

  const [run] = await sql<{ id: number }>`
    insert into scrape_runs (triggered_by) values (${triggeredBy}) returning id
  `;
  const runId = run.id;

  const candidates = await sql<MatchCandidate>`select id, name from products`;
  const matchIndex = buildMatchIndex(candidates);
  const summary: ScrapeRunSummary["stores"] = [];
  let totalStaged = 0;

  for (const scraper of storeScrapers) {
    const [storeResult] = await sql<{ id: number }>`
      insert into scrape_store_results (run_id, store_id, status)
      values (${runId}, ${scraper.storeIds[0]}, 'running')
      returning id
    `;
    try {
      const items = await scraper.run();
      // A scraper reads someone else's HTML/JSON — a misparsed decimal, a
      // "you save" figure, or a stray SKU number is exactly as likely as a
      // real price. Nothing downstream re-checks raw_price before it can be
      // bulk-approved straight into the live `prices` table, so junk gets
      // filtered out here rather than staged and trusted later.
      const validItems = items.filter((item) => Number.isFinite(item.price) && item.price > 0 && item.price <= MAX_PRICE_XCG);
      for (const item of validItems) {
        const match = bestMatch(item.name, matchIndex);
        for (const storeId of scraper.storeIds) {
          await sql`
            insert into scraped_prices
              (run_id, store_id, raw_name, raw_unit, raw_price, raw_url, matched_product_id, match_confidence)
            values
              (${runId}, ${storeId}, ${item.name}, ${item.unit}, ${item.price}, ${item.url ?? null},
               ${match?.productId ?? null}, ${match?.confidence ?? null})
          `;
          totalStaged++;
        }
      }
      await sql`
        update scrape_store_results
        set status = 'success', items_found = ${items.length}, finished_at = now()
        where id = ${storeResult.id}
      `;
      summary.push({ chainId: scraper.chainId, storeCount: scraper.storeIds.length, itemsFound: items.length, status: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await sql`
        update scrape_store_results
        set status = 'error', error = ${message}, finished_at = now()
        where id = ${storeResult.id}
      `;
      summary.push({ chainId: scraper.chainId, storeCount: scraper.storeIds.length, itemsFound: 0, status: "error", error: message });
    }
  }

  const autoApproved = await autoApproveExactMatches(sql, runId);

  await sql`update scrape_runs set status = 'completed', finished_at = now() where id = ${runId}`;

  return { runId, stores: summary, totalStaged, autoApproved };
}
