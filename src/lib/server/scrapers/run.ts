import { getSql } from "@/lib/db";
import { storeScrapers } from "./index";
import { bestMatch, type MatchCandidate } from "./match";

export type ScrapeRunSummary = {
  runId: number;
  stores: { chainId: string; storeCount: number; itemsFound: number; status: "success" | "error"; error?: string }[];
  totalStaged: number;
};

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
      for (const item of items) {
        const match = bestMatch(item.name, candidates);
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

  await sql`update scrape_runs set status = 'completed', finished_at = now() where id = ${runId}`;

  return { runId, stores: summary, totalStaged };
}
