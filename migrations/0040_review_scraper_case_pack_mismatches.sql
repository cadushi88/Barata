-- migrations/0040_review_scraper_case_pack_mismatches.sql
-- Human review of the 21 pending scraped_prices rows left untouched by
-- migration 0039 (all scraper-matched at 0.73-0.81 confidence, below the
-- 1.00 bar that migration used).
--
-- Finding: 18 of the 21 rows (9 case-lot items x 2 stores) are Mangusa
-- Hypermarket webshop listings for
-- a CASE of an existing single-unit product -- the raw_url itself says so
-- (e.g. .../hardon-black-tea-25pc-12-pieces/), and the raw_price is the
-- price for the whole case, not one unit. The scraper's fuzzy matcher had
-- linked each one to the existing SINGLE-unit catalog product by name
-- similarity alone, which is exactly why confidence landed at 0.73-0.76:
-- approving as-is would have overwritten that product's price with the
-- case total (e.g. recording XCG 34.80 as "the price" of a single 25-count
-- box of Hardon tea that a matching single-piece listing, already approved
-- earlier, correctly prices at XCG 2.90 -- 34.80 / 12 = 2.90 exactly).
-- Confirmed real, not a scrape glitch: every one of the 9 case-lot items
-- below (mangusa-hyper and mangusa-rio share one webshop and hence one
-- case price, so each item is 2 rows) has its own distinct real product
-- page. So each case-lot gets its own new product here, priced at
-- the real case total, rather than being merged into or dropped in favor
-- of the single-unit product.
--
-- The 19th row, "Biju White Rice, 1 kg" (goisco, raw_url confirms a real
-- goisco.com product page), was left completely unmatched by the scraper.
-- The catalog's only "white rice, 1kg" entry is a generic unbranded
-- placeholder (id 10724) -- Biju is a real, identifiable brand, so this
-- gets its own new branded product rather than being folded into the
-- generic one.
--
-- The remaining 2 rows, "Tropic Tomato paste 500gr (1 piece)" (both
-- stores), are genuinely single-unit listings (the raw_url says
-- "-1-piece/") already correctly matched to the existing single-unit
-- Tropic Tomato Paste product (id 10818) -- just a different, real,
-- separately-sourced price observation (XCG 5.15 online vs. the existing
-- XCG 5.25 from the FPK survey). No new product needed; only bumping
-- match_confidence to reflect this row's now being verified by a human.
--
-- All 21 rows are then approved via the exact same claim-then-insert
-- pattern as migration 0039 (mirrors approveScrapedPrice/approveAllPending
-- in src/lib/server/scrape-review.ts), now that every one of them is a
-- confirmed, correctly-matched, real price.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('hardon-black-tea-25pc-12pack', 'Hardon Black Tea 25pc, 12-Pack', null, 'Drinks', '12 x 25pc', 300, 'ct'),
  ('incolac-full-cream-milk-powder-400gr-24pack', 'Incolac Full Cream Milk Powder 400gr, 24-Pack', 'Incolac', 'Dairy', '24 x 400gr', 9600, 'g'),
  ('jumbo-erwten-soep-300ml-12pack', 'Jumbo Erwten Soep 300ml, 12-Pack', null, 'Pantry', '12 x 300ml', 3600, 'ml'),
  ('jumbo-erwten-soep-800ml-6pack', 'Jumbo Erwten Soep 800ml, 6-Pack', null, 'Pantry', '6 x 800ml', 4800, 'ml'),
  ('jumbo-tomaten-soep-1200ml-6pack', 'Jumbo Tomaten Soep 1200ml, 6-Pack', null, 'Pantry', '6 x 1200ml', 7200, 'ml'),
  ('jumbo-tomaten-soep-800ml-6pack', 'Jumbo Tomaten Soep 800ml, 6-Pack', null, 'Pantry', '6 x 800ml', 4800, 'ml'),
  ('lipton-yellow-label-25pc-24pack', 'Lipton Yellow Label 25pc, 24-Pack', null, 'Drinks', '24 x 25pc', 600, 'ct'),
  ('tropic-tomato-paste-500gr-12pack', 'Tropic Tomato Paste 500gr, 12-Pack', null, 'Pantry', '12 x 500gr', 6000, 'g'),
  ('u-kotex-maxi-regular-24pc-6pack', 'U Kotex Maxi Regular 24pc, 6-Pack', 'Kotex', 'Household', '6 x 24pc', 144, 'ct'),
  ('biju-white-rice-1kg', 'Biju White Rice, 1 kg', 'Biju', 'Pantry', '1 kg', 1, 'kg');

update scraped_prices set matched_product_id = (select id from products where slug = 'hardon-black-tea-25pc-12pack'), match_confidence = 1
where id in (14, 15);
update scraped_prices set matched_product_id = (select id from products where slug = 'incolac-full-cream-milk-powder-400gr-24pack'), match_confidence = 1
where id in (22, 23);
update scraped_prices set matched_product_id = (select id from products where slug = 'jumbo-erwten-soep-300ml-12pack'), match_confidence = 1
where id in (60, 61);
update scraped_prices set matched_product_id = (select id from products where slug = 'jumbo-erwten-soep-800ml-6pack'), match_confidence = 1
where id in (42, 43);
update scraped_prices set matched_product_id = (select id from products where slug = 'jumbo-tomaten-soep-1200ml-6pack'), match_confidence = 1
where id in (48, 49);
update scraped_prices set matched_product_id = (select id from products where slug = 'jumbo-tomaten-soep-800ml-6pack'), match_confidence = 1
where id in (54, 55);
update scraped_prices set matched_product_id = (select id from products where slug = 'lipton-yellow-label-25pc-24pack'), match_confidence = 1
where id in (66, 67);
update scraped_prices set matched_product_id = (select id from products where slug = 'tropic-tomato-paste-500gr-12pack'), match_confidence = 1
where id in (16, 17);
update scraped_prices set matched_product_id = (select id from products where slug = 'u-kotex-maxi-regular-24pc-6pack'), match_confidence = 1
where id in (28, 29);
update scraped_prices set matched_product_id = (select id from products where slug = 'biju-white-rice-1kg'), match_confidence = 1
where id = 11;
update scraped_prices set match_confidence = 1
where id in (18, 19);

with approved_batch as (
  update scraped_prices
  set status = 'approved', reviewed_at = now()
  where status = 'pending' and matched_product_id is not null and match_confidence >= 1
  returning store_id, matched_product_id, raw_price, source, user_id, observed_at
)
insert into prices (product_id, store_id, amount, source, user_id, observed_at)
select matched_product_id, store_id, raw_price, source, user_id, coalesce(observed_at, now())
from approved_batch;
