-- migrations/0039_approve_high_confidence_pending_prices.sql
-- Approves the 78 pending scraped_prices rows that are exact, human-verified
-- matches (match_confidence = 1.00): the 76 receipt-transcribed rows from
-- migrations 0030/0036/0037/0038 and 2 manually-reported ONL rows (mangusa-hyper,
-- SKU-identified, also confidence 1.00). Mirrors exactly what the admin
-- dashboard's approveScrapedPrice/approveAllPending server functions do
-- (src/lib/server/scrape-review.ts): claim each still-pending row, then
-- insert its price into the real `prices` table.
--
-- Deliberately narrower than the real "Accept all" button: that approves
-- every matched pending row with no confidence floor, but this migration
-- adds "and match_confidence >= 1" so it does NOT touch the other 21
-- pending rows currently in the queue -- all scraper-matched at 0.73-0.81
-- confidence (fuzzy case-pack matches like "Hardon Black tea 25pc (12
-- pieces)"), plus one completely unmatched row ("Biju White Rice, 1 kg").
-- Those stay pending for a human reviewer, same as this session has done
-- throughout (see migration 0035's identical reasoning for leaving the
-- Biju White Rice row untouched).
--
-- reviewed_by is left null -- there's no real authenticated admin session
-- behind a migration, same as migration 0035's rejections.

with approved_batch as (
  update scraped_prices
  set status = 'approved', reviewed_at = now()
  where status = 'pending' and matched_product_id is not null and match_confidence >= 1
  returning store_id, matched_product_id, raw_price, source, user_id, observed_at
)
insert into prices (product_id, store_id, amount, source, user_id, observed_at)
select matched_product_id, store_id, raw_price, source, user_id, coalesce(observed_at, now())
from approved_batch;
