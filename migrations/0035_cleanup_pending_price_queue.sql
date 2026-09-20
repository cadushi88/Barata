-- migrations/0035_cleanup_pending_price_queue.sql
-- Audit of the /admin/prices pending queue (133 rows): 20 already had a
-- correct product match (from the receipt-2 and webshop-screenshot
-- submissions -- left untouched, still awaiting normal admin approval).
-- Of the other 113 that were unmatched despite some scoring up to 0.84
-- confidence, cross-checking every one against the live catalog found:
--
--   - 92 are pure duplicates: exact product name match, and that
--     exact price at that exact store is ALREADY recorded in `prices`
--     (mostly stale staging rows for the 5 produce items just merged in
--     migration 0034, plus a duplicate "Folgers Classic Roast" submission,
--     plus the single-can Incolac price already on file).
--     Rejecting these -- approving would just re-record what's already there.
--   - 20 are genuine new price observations (mostly case-pack prices,
--     e.g. "Jumbo Erwten soep 800ml (6 pieces)", or the 24-can Incolac case)
--     that exactly match an existing product by name but were never linked.
--     These get their matched_product_id set and stay 'pending' -- still
--     needs a human's normal approve click, this only fixes the broken
--     product link so it shows up correctly in the review queue.
--   - 1 is left alone: "Biju White Rice, 1 kg" only came close to a
--     generic, unbranded "White rice 1 kg" placeholder product -- linking it
--     would silently lose the brand, so it's left for a human to decide.

update scraped_prices set status = 'rejected', reviewed_at = now()
where id in (74, 80, 81, 7, 13, 20, 21, 24, 25, 104, 105, 88, 89, 75, 72, 73, 86, 87, 84, 85, 108, 109, 70, 71, 96, 97, 100, 101, 112, 113, 102, 103, 78, 79, 76, 77, 82, 83, 110, 111, 92, 93, 98, 99, 34, 35, 36, 37, 90, 91, 94, 95, 12, 106, 107, 3, 2, 10, 44, 45, 46, 47, 62, 63, 64, 65, 50, 51, 52, 53, 56, 57, 58, 59, 1, 5, 9, 6, 26, 27, 30, 31, 32, 33, 38, 39, 40, 41, 4, 8, 68, 69);

update scraped_prices set matched_product_id = 5927 where id = 14;
update scraped_prices set matched_product_id = 5927 where id = 15;
update scraped_prices set matched_product_id = 10818 where id = 16;
update scraped_prices set matched_product_id = 10818 where id = 17;
update scraped_prices set matched_product_id = 10818 where id = 18;
update scraped_prices set matched_product_id = 10818 where id = 19;
update scraped_prices set matched_product_id = 10851 where id = 22;
update scraped_prices set matched_product_id = 10851 where id = 23;
update scraped_prices set matched_product_id = 6262 where id = 42;
update scraped_prices set matched_product_id = 6262 where id = 43;
update scraped_prices set matched_product_id = 6261 where id = 60;
update scraped_prices set matched_product_id = 6261 where id = 61;
update scraped_prices set matched_product_id = 6271 where id = 48;
update scraped_prices set matched_product_id = 6271 where id = 49;
update scraped_prices set matched_product_id = 6272 where id = 54;
update scraped_prices set matched_product_id = 6272 where id = 55;
update scraped_prices set matched_product_id = 8060 where id = 28;
update scraped_prices set matched_product_id = 8060 where id = 29;
update scraped_prices set matched_product_id = 5932 where id = 66;
update scraped_prices set matched_product_id = 5932 where id = 67;
