-- migrations/0036_receipt3_centrum_mahaai_20260912.sql
-- Transcribed by hand from a photo of a Centrum Mahaai receipt (Dr.
-- Caprilesweg 2, Curacao N.A.; Trans#870245, Inv#00362862, 9/12/2026 18:26)
-- sent directly in chat as "New item receipt" -- unlike Receipt #2 Mangusa,
-- this photo did not come through the app's own receipt-submission queue
-- (receipts.photo_data), so there is no existing `receipts` row to look up
-- or update here. Every line below lands straight in scraped_prices with
-- receipt_id left null.
--
-- The receipt prints 26 total line items and an XCG 141.68 net/sub total;
-- both check out exactly against a full transcription of all 26 lines
-- (including the one -- Squash -- left out of this migration, see below):
-- 2 Champignon + 5 Royal Gelatin + 1 Cilantro + 2 Popcorn + 1 Squash + 1
-- Chicken Wings + 1 Ribeye + 4 Canada Dry + 4 Tuna + 4 Alpro + 1 Knoflook =
-- 26 lines, and summing every line's printed price (6.25*2 + 2.83*5 + 4.25 +
-- 8.51*2 + 8.81 + 8.98 + 34.30 + 1.60*4 + 2.38*4 + 5.95*4 + 1.95) = XCG
-- 141.68 exactly. The "Markdown: Cg 1.22" printed under each Alpro line (4 *
-- 1.22 = the printed "Saving grand total" of Cg 4.88) is informational only
-- -- it is not subtracted from Net/Total Sales/Sub Total/Amount Charged, all
-- four of which equal the undiscounted 141.68 -- so the price recorded per
-- Alpro unit below is the printed 5.95, i.e. what was actually charged.
--
-- New-product-vs-existing-match calls:
--   - Cilantro USA pc -> matches existing "Cilantro" (id 9250, unit "each"),
--     a fresh bunch sold by the piece, same as this line's "pc".
--   - Popcorn White Cheddar SMAR ("SMAR" = Smartfood) does NOT match the
--     existing Smartfood White Cheddar Popcorn catalog row (id 5344): that
--     one is a 50-count US warehouse-club variety pack, not a single bag --
--     XCG 8.51 for 1/50th of that pack would be a fantasy price. New,
--     single-bag product instead.
--   - Chicken Wings Family Pack does NOT match the existing per-kg "Chicken
--     Wings" row (id 10909, unit "1 kg"): a fixed-price retail "family pack"
--     is a different unit than a per-kg raw-meat price, and mixing the two
--     would misprice both. New product.
--   - Alpro Coconut Original with Rice is a different drink than the
--     existing "Alpro Barista coconut w soya 1ltr" (id 6459) -- new product,
--     same unit convention as that sibling (unit "each", size in the name).
--   - Royal Gelatin Orange Sugar is the regular (not sugar-free) line next
--     to the already-catalogued "Royal Gelatine orange sugar free 0.32oz"
--     (id 6957) -- a different SKU, new product.
--   - Champignon Middel 250gr, Frozen Ribeye Barra Brasil, Canada Dry Ginger
--     All Zero, Tuna PRF Catch Shredded in Water, and Knoflook [Garlic]
--     250gr have no existing catalog match at all -- all five are new
--     products.
--
-- Deliberately left out: Squash Zuchinni XFCY USA k. Every other line on
-- this receipt is a flat, already-computed total, but this is the one item
-- with no printed weight or per-kg rate breakdown ("X kg @ Y/kg") backing
-- its Cg 8.81 -- the trailing "k" reads as a scale/weighed-item department
-- code, meaning that price was rung up for whatever specific weight of
-- squash was on the scale that day, not a stable, comparable per-kg price.
-- Recording it (as either "8.81/kg" or "8.81 each") would misrepresent an
-- unknown-quantity purchase as a real price, the same reasoning Receipt #2
-- Mangusa used to exclude its butcher-counter cuts.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('champignon-middel-250gr', 'Champignon Middel', null, 'Pantry', '250g', 250, 'g'),
  ('royal-gelatin-orange-regular', 'Royal Gelatin Orange (Regular)', 'Royal', 'Snacks', 'each', null, null),
  ('popcorn-white-cheddar-smartfood-single', 'Smartfood White Cheddar Popcorn', 'Smartfood', 'Snacks', 'each', null, null),
  ('chicken-wings-family-pack', 'Chicken Wings Family Pack', null, 'Meat', 'each', null, null),
  ('frozen-ribeye-barra-brasil', 'Frozen Ribeye Barra Brasil', null, 'Meat', 'each', null, null),
  ('canada-dry-ginger-ale-all-zero-single', 'Canada Dry Ginger Ale All Zero', 'Canada Dry', 'Beverages', 'each', null, null),
  ('tuna-prf-catch-shredded-water', 'Tuna PRF Catch Shredded in Water', null, 'Pantry', 'each', null, null),
  ('alpro-coconut-original-with-rice-1ltr', 'Alpro Coconut Original with Rice 1ltr', 'Alpro', 'Dairy', 'each', null, null),
  ('knoflook-garlic-250gr', 'Knoflook (Garlic)', null, 'Produce', '250g', 250, 'g');

create temporary table _receipt3_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _receipt3_prices (slug, raw_name, raw_price) values
  ('champignon-middel-250gr', 'Champignon middel 250gr', 6.25),
  ('royal-gelatin-orange-regular', 'Royal gelatin orange sugar', 2.83),
  ('cilantro', 'Cilantro usa pc', 4.25),
  ('popcorn-white-cheddar-smartfood-single', 'Popcorn white cheddar smar', 8.51),
  ('chicken-wings-family-pack', 'Chicken wings family pack', 8.98),
  ('frozen-ribeye-barra-brasil', 'Frozen ribeye barra brasi', 34.30),
  ('canada-dry-ginger-ale-all-zero-single', 'Canada dry ginger all zero', 1.60),
  ('tuna-prf-catch-shredded-water', 'Tuna prf catch shred in wa', 2.38),
  ('alpro-coconut-original-with-rice-1ltr', 'Alpro coconut orig with ri', 5.95),
  ('knoflook-garlic-250gr', 'Knoflook [garlic] 250gr', 1.95);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, user_id, receipt_id, observed_at)
select
  'centrum-mahaai', t.raw_name, t.raw_price, p.id, 1, 'pending', 'receipt', null, null, '2026-09-12T18:26:00Z'
from _receipt3_prices t
join products p on p.slug = t.slug;

drop table _receipt3_prices;
