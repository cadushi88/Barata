import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import { runScrapeAndStage } from "./scrapers/run";

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
};

export const listScrapeRuns = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<ScrapeRunRow>`
    select id, started_at::text, finished_at::text, status, triggered_by
    from scrape_runs
    order by started_at desc
    limit 20
  `;
});

export const getScrapeRunDetail = createServerFn({ method: "GET" })
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
        p.name as matched_product_name, sp.match_confidence::text as match_confidence, sp.status
      from scraped_prices sp
      join stores s on s.id = sp.store_id
      left join products p on p.id = sp.matched_product_id
      where sp.run_id = ${data.runId}
      order by (sp.matched_product_id is null), sp.match_confidence desc nulls last, sp.raw_name
    `;
    return { storeResults, prices };
  });

export const triggerScrapeRun = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async () => {
    const summary = await runScrapeAndStage("manual");
    return summary;
  });

export const approveScrapedPrice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const [row] = await sql<{ store_id: string; matched_product_id: number | null; raw_price: string; status: string }>`
      select store_id, matched_product_id, raw_price::text as raw_price, status from scraped_prices where id = ${data.id}
    `;
    if (!row) return { ok: false as const, error: "Not found" };
    if (row.status !== "pending") return { ok: false as const, error: "Already reviewed" };
    if (row.matched_product_id == null) {
      return { ok: false as const, error: "No matched product — map it manually before approving" };
    }
    await sql`
      insert into prices (product_id, store_id, amount, source)
      values (${row.matched_product_id}, ${row.store_id}, ${row.raw_price}, 'scraper')
    `;
    await sql`
      update scraped_prices set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId}
      where id = ${data.id}
    `;
    return { ok: true as const };
  });

export const rejectScrapedPrice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      update scraped_prices set status = 'rejected', reviewed_at = now(), reviewed_by = ${context.userId}
      where id = ${data.id} and status = 'pending'
    `;
    return { ok: true as const };
  });

/** Approves every pending, high-confidence match for a run in one action — the common case (a well-matched price bump) shouldn't need one click per item. */
export const bulkApproveHighConfidence = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { runId: number; minConfidence?: number }) =>
    z.object({ runId: z.number().int().positive(), minConfidence: z.number().min(0).max(1).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const threshold = data.minConfidence ?? 0.85;
    const sql = await getSql();
    const candidates = await sql<{ id: number; store_id: string; matched_product_id: number; raw_price: string }>`
      select id, store_id, matched_product_id, raw_price::text as raw_price
      from scraped_prices
      where run_id = ${data.runId} and status = 'pending'
        and matched_product_id is not null and match_confidence >= ${threshold}
    `;
    for (const c of candidates) {
      await sql`insert into prices (product_id, store_id, amount, source) values (${c.matched_product_id}, ${c.store_id}, ${c.raw_price}, 'scraper')`;
      await sql`update scraped_prices set status = 'approved', reviewed_at = now(), reviewed_by = ${context.userId} where id = ${c.id}`;
    }
    return { ok: true as const, n: candidates.length };
  });
