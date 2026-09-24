-- Approves every currently-pending scraped_prices row that is an exact,
-- 100%-confidence match (match_confidence = 1.00) — the daily scraper cron
-- (vercel.json, 0 6 * * *) and any manual runs since migration 0039 keep
-- adding new rows to the queue, so this re-runs that same narrow approval
-- rather than a blanket "Accept all". Mirrors exactly what the admin
-- dashboard's approveScrapedPrice/approveAllPending server functions do
-- (src/lib/server/scrape-review.ts): claim each still-pending row, then
-- insert its price into the real `prices` table.
--
-- Deliberately narrower than the real "Accept all" button or the UI's
-- "Bulk-approve high-confidence matches" (which defaults to >= 0.85): this
-- only touches match_confidence >= 1, so any fuzzy (< 100%) match stays
-- pending for a human reviewer, same reasoning as migration 0039.
--
-- reviewed_by is left null -- there's no real authenticated admin session
-- behind a migration, same as migrations 0035/0039's rejections/approvals.
-- Safe to run even if nothing is currently pending at this confidence --
-- the WHERE clause simply matches zero rows in that case.

with approved_batch as (
  update scraped_prices
  set status = 'approved', reviewed_at = now()
  where status = 'pending' and matched_product_id is not null and match_confidence >= 1
  returning store_id, matched_product_id, raw_price, source, user_id, observed_at
)
insert into prices (product_id, store_id, amount, source, user_id, observed_at)
select matched_product_id, store_id, raw_price, source, user_id, coalesce(observed_at, now())
from approved_batch;
