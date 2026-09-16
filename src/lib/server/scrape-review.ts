import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { adminMiddleware } from "@/lib/auth/admin-middleware";
import { z } from "zod";
import { runScrapeAndStage } from "./scrapers/run";
import { closestCandidate, type MatchCandidate } from "./scrapers/match";

export type ScrapeRunRow = {
  id: number;
  started_at: string;
  finished_at: string | null;
  status: string;
  triggered_by: string;
};

export type ScrapeStoreResultRow = {
  id: number;
  run_id: number;
  store_id: string;
  store_name: string;
  status: string;
  items_found: number;
  error: string | null;
};

export type ScrapedPriceRow = {
  id: number;
  store_id: string;
  store_name: string;
  raw_name: string;
  raw_unit: string | null;
  raw_price: string;
  raw_url: string | null;
  matched_product_id: number | null;
  matched_product_name: string | null;
  match_confidence: string | null;
  status: string;
  source: string;
  created_at: string;
};

export const listScrapeRuns = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<ScrapeRunRow>`
      select id, started_at::text, finished_at::text, status, triggered_by
      from scrape_runs
      order by started_at desc
      limit 20
    `;
  });

export const getScrapeRunDetail = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .validator((input: { runId: number }) => z.object({ runId: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const storeResults = await sql<ScrapeStoreResultRow>`
      select r.id, r.run_id, r.store_id, s.name as store_name, r.status, r.items_found, r.error
      from scrape_store_results r
      join stores s on s.id = r.store_id
      where r.run_id = ${data.runId}
      order by s.name
    `;
    const prices = await sql<ScrapedPriceRow>`
      select
        sp.id, sp.store_id, s.name as store_name, sp.raw_name, sp.raw_unit,
        sp.raw_price::text as raw_price, sp.raw_url, sp.matched_product_id,
        p.name as matched_product_name, sp.match_confidence::text as match_confidence,
        sp.status, sp.source, sp.created_at::text as created_at
      from scraped_prices sp
      join stores s on s.id = sp.store_id
      left join products p on p.id = sp.matched_product_id
      where sp.run_id = ${data.runId}
      order by (sp.matched_product_id is null), sp.match_confidence desc nulls last, sp.raw_name
    `;
    return { storeResults, prices };
  });

export type PendingPriceRow = ScrapedPriceRow & {
  user_email: string | null;
  /**
   * Best-effort guess for a row bestMatch left unmatched — same scoring, no
   * confidence floor, computed here (never stored) purely so a reviewer
   * isn't starting from zero on every "no match" row. Null for matched rows
   * and for rows with literally no shared words with anything in the catalog.
   */
  closest_guess_product_id: number | null;
  closest_guess_name: string | null;
  closest_guess_confidence: number | null;
};

/** Every pending price change regardless of source (scraper run, receipt, manual report) — the admin dashboard's main queue. */
export const listPendingPrices = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<ScrapedPriceRow & { user_email: string | null }>`
      select
        sp.id, sp.store_id, s.name as store_name, sp.raw_name, sp.raw_unit,
        sp.raw_price::text as raw_price, sp.raw_url, sp.matched_product_id,
        p.name as matched_product_name, sp.match_confidence::text as match_confidence,
        sp.status, sp.source, sp.created_at::text as created_at, u.email as user_email
      from scraped_prices sp
      join stores s on s.id = sp.store_id
      left join products p on p.id = sp.matched_product_id
      left join "user" u on u."id" = sp.user_id
      where sp.status = 'pending'
      order by sp.created_at desc
    `;
    if (rows.every((r) => r.matched_product_id != null)) {
      return rows.map((r) => ({
        ...r,
        closest_guess_product_id: null,
        closest_guess_name: null,
        closest_guess_confidence: null,
      }));
    }
    const candidates = await sql<MatchCandidate>`select id, name from products`;
    const candidateNameById = new Map(candidates.map((c) => [c.id, c.name]));
    return rows.map((r): PendingPriceRow => {
      if (r.matched_product_id != null) {
        return { ...r, closest_guess_product_id: null, closest_guess_name: null, closest_guess_confidence: null };
      }
      const guess = closestCandidate(r.raw_name, candidates);
      return {
        ...r,
        closest_guess_product_id: guess?.productId ?? null,
        closest_guess_name: guess ? (candidateNameById.get(guess.productId) ?? null) : null,
        closest_guess_confidence: guess?.confidence ?? null,
      };
    });
  });

export const triggerScrapeRun = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const summary = await runScrapeAndStage("manual");
    return summary;
  });

export const approveScrapedPrice = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    // Pre-check purely for a specific error message — the real guard against two
    // near-simultaneous approve calls double-inserting into `prices` is the
    // status='pending' condition on the UPDATE below (mirrors rejectScrapedPrice).
    const [existing] = await sql<{ status: string; matched_product_id: number | null }>`
      select status, matched_product_id from scraped_prices where id = ${data.id}
    `;
    if (!existing) return { ok: false as const, error: "Not found" };
    if (existing.matched_product_id == null) {
      return { ok: false as const, error: "No matched product — map it manually before approving" };
    }
    // Atomically claim the row: only a request that actually flips a still-pending
    // row to 'approved' may proceed to insert into `prices`, so two overlapping
    // approve calls (or an approve racing bulkApproveHighConfidence) can't both win.
    const [row] = await sql<{
      store_id: string;
      matched_product_id: number;
      raw_price: string;
      source: string;
      user_id: string | null;
      observed_at: string | null;
    }>`
      update scraped_prices set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId}
      where id = ${data.id} and status = 'pending'
      returning store_id, matched_product_id, raw_price::text as raw_price, source, user_id, observed_at::text as observed_at
    `;
    if (!row) return { ok: false as const, error: "Already reviewed" };
    await sql`
      insert into prices (product_id, store_id, amount, source, user_id, observed_at)
      values (
        ${row.matched_product_id}, ${row.store_id}, ${row.raw_price}, ${row.source}, ${row.user_id},
        ${row.observed_at ?? new Date().toISOString()}
      )
    `;
    return { ok: true as const };
  });

export const rejectScrapedPrice = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    // Same `WHERE status = 'pending' RETURNING` guard as approveScrapedPrice: without
    // it this silently reported success even when the row was already reviewed or
    // didn't exist, which is how the id-not-found/already-handled case went unnoticed.
    const [row] = await sql<{ id: number }>`
      update scraped_prices set status = 'rejected', reviewed_at = now(), reviewed_by = ${context.userId}
      where id = ${data.id} and status = 'pending'
      returning id
    `;
    if (!row) return { ok: false as const, error: "Already reviewed" };
    return { ok: true as const };
  });

/**
 * A reviewer confirming the "closest guess" hint shown for an unmatched row —
 * links it to that product so it becomes a normal approvable match. Never
 * writes to `prices` itself; the row still goes through the usual
 * approve/approveAllPending path afterward. Guarded the same way as every
 * other single-row mutation here: only a still-pending, still-unmatched row
 * can be claimed, so a stale "closest guess" button can't silently relink an
 * already-handled row.
 */
export const confirmClosestGuess = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { id: number; productId: number; confidence: number | null }) =>
    z
      .object({ id: z.number().int().positive(), productId: z.number().int().positive(), confidence: z.number().min(0).max(1).nullable() })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [row] = await sql<{ id: number }>`
      update scraped_prices set matched_product_id = ${data.productId}, match_confidence = ${data.confidence}
      where id = ${data.id} and status = 'pending' and matched_product_id is null
      returning id
    `;
    if (!row) return { ok: false as const, error: "Already reviewed or matched" };
    return { ok: true as const };
  });

/**
 * Rejects every pending row with no matched product in one action — the
 * counterpart to approveAllPending. A "no match" row can never be approved
 * as-is (there's nothing to publish it against), so once a scraper run stages
 * a batch of junk or unrecognized items, clearing them one Reject click at a
 * time doesn't scale. Never touches matched rows — those still go through
 * individual review or approveAllPending.
 */
export const rejectAllUnmatched = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      update scraped_prices set status = 'rejected', reviewed_at = now(), reviewed_by = ${context.userId}
      where status = 'pending' and matched_product_id is null
      returning id
    `;
    return { ok: true as const, n: rows.length };
  });

/** Approves every pending, high-confidence match for a run in one action — the common case (a well-matched price bump) shouldn't need one click per item. */
export const bulkApproveHighConfidence = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { runId: number; minConfidence?: number }) =>
    z.object({ runId: z.number().int().positive(), minConfidence: z.number().min(0).max(1).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const threshold = data.minConfidence ?? 0.85;
    const sql = await getSql();
    // One atomic UPDATE claims every still-pending, high-confidence row for this run
    // in a single statement (WHERE status = 'pending' guards against overlap with a
    // concurrent individual approveScrapedPrice/rejectScrapedPrice call — same guard
    // as there, just applied set-wise) and RETURNING hands back exactly the rows this
    // call actually claimed, replacing the former select-then-loop-of-queries.
    const rows = await sql<{
      id: number;
      store_id: string;
      matched_product_id: number;
      raw_price: string;
      source: string;
      user_id: string | null;
      observed_at: string | null;
    }>`
      update scraped_prices set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId}
      where run_id = ${data.runId} and status = 'pending'
        and matched_product_id is not null and match_confidence >= ${threshold}
      returning id, store_id, matched_product_id, raw_price::text as raw_price, source, user_id, observed_at::text as observed_at
    `;
    if (rows.length > 0) {
      // Single multi-row INSERT instead of one query per row.
      const cols = 6;
      const valuesSql = rows
        .map((_, i) => `(${Array.from({ length: cols }, (_, j) => `$${i * cols + j + 1}`).join(", ")})`)
        .join(", ");
      const params = rows.flatMap((r) => [
        r.matched_product_id,
        r.store_id,
        r.raw_price,
        r.source,
        r.user_id,
        r.observed_at ?? new Date().toISOString(),
      ]);
      await sql.query(
        `insert into prices (product_id, store_id, amount, source, user_id, observed_at) values ${valuesSql}`,
        params,
      );
    }
    return { ok: true as const, n: rows.length };
  });

/**
 * Approves every pending, matched price change across the whole queue (any run,
 * any source — scraper, receipt, or manual report) in one action. Same atomic
 * claim-then-batch-insert pattern as bulkApproveHighConfidence, just without the
 * run/confidence filter — this is the admin dashboard's "Accept all" button,
 * for clearing a large backlog (e.g. after a bulk import) without a
 * per-run confidence cutoff or one click per row. Unmatched rows (no
 * matched_product_id) are never touched — there's nothing to publish yet.
 */
export const approveAllPending = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      store_id: string;
      matched_product_id: number;
      raw_price: string;
      source: string;
      user_id: string | null;
      observed_at: string | null;
    }>`
      update scraped_prices set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId}
      where status = 'pending' and matched_product_id is not null
      returning id, store_id, matched_product_id, raw_price::text as raw_price, source, user_id, observed_at::text as observed_at
    `;
    if (rows.length > 0) {
      const cols = 6;
      const valuesSql = rows
        .map((_, i) => `(${Array.from({ length: cols }, (_, j) => `$${i * cols + j + 1}`).join(", ")})`)
        .join(", ");
      const params = rows.flatMap((r) => [
        r.matched_product_id,
        r.store_id,
        r.raw_price,
        r.source,
        r.user_id,
        r.observed_at ?? new Date().toISOString(),
      ]);
      await sql.query(
        `insert into prices (product_id, store_id, amount, source, user_id, observed_at) values ${valuesSql}`,
        params,
      );
    }
    return { ok: true as const, n: rows.length };
  });
