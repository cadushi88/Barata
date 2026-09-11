-- migrations/0021_goisco_receipt_2609.sql
-- Two real Goisco Wholesale Club receipts (same member, 2026-09-10, six
-- minutes apart -- invoice 00269761, transactions 589630 and 589631).
-- Prices used are the listed/normal shelf price printed on each receipt
-- line, NOT the "Member discount" amount below it -- that discount is a
-- loyalty-program perk for this specific member, not the price other
-- shoppers see.
--
-- Skipped intentionally (out of scope for a grocery price-comparison app,
-- or genuinely ambiguous): Under Armour clothing, ON Gold Standard Whey
-- protein supplement, Canaillou Adult Cat Food and 4 Purina Friskies
-- variants (no "Pet" category exists yet), and one duplicate "Royal
-- Gelatin Sugar Free" line (same price, printed twice on the receipt).

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('ariel-original-8-5kg', 'Ariel Original', 'Ariel', 'Household', '8.5 kg', null, null),
  ('goisco-bleach-1gl-lemon', 'Goisco Bleach Lemon', 'Goisco', 'Household', '1 gl', null, null),
  ('goisco-bleach-1gl', 'Goisco Bleach', 'Goisco', 'Household', '1 gl', null, null),
  ('power-house-vinegar-cleaner', 'Power House Vinegar Cleaner', 'Power House', 'Household', '1 pc', null, null),
  ('bj-disinfecting-wipes-canister', 'BJ Disinfecting Wipes Canister', 'BJ', 'Household', '1 canister', null, null),
  ('jubilee-bathroom-tissue-large', 'Jubilee Bathroom Tissue Large', 'Jubilee', 'Household', '1 pc', null, null),
  ('royal-gelatin-sugar-free', 'Royal Gelatin Sugar Free', 'Royal', 'Pantry', '1 pc', null, null),
  ('atlantic-salmon-portions', 'Atlantic Salmon Portions', '', 'Frozen', '1 pack', null, null),
  ('whole-mushrooms-16oz', 'Whole Mushrooms', '', 'Produce', '16 oz', null, null),
  ('fresh-garlic-250gr', 'Fresh Garlic', '', 'Produce', '250 gr', null, null),
  ('409-sponge-brush', '409 Sponge Brush', '409', 'Household', '1 ct', null, null),
  ('wf-chocolate-chips-granola', 'WF Chocolate Chips Granola', 'WF', 'Pantry', '1 pc', null, null),
  ('folgers-classic-roast-43oz', 'Folgers Classic Roast', 'Folgers', 'Drinks', '43 oz', null, null),
  ('arm-hammer-advance-white-6oz', 'Arm & Hammer Advance White', 'Arm & Hammer', 'Personal Care', '6 oz', null, null),
  ('listerine-fresh-burst-1lt', 'Listerine Fresh Burst', 'Listerine', 'Personal Care', '1 lt', null, null),
  ('co-op-stainless-steel-scour', 'Co-op Stainless Steel Scour Pad', '', 'Household', '1 ct', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', v.amount, v.observed_at::timestamptz, 'receipt'
from (values
  ('ariel-original-8-5kg', 55.78, '2026-09-10'),
  ('goisco-bleach-1gl-lemon', 6.31, '2026-09-10'),
  ('goisco-bleach-1gl', 6.31, '2026-09-10'),
  ('power-house-vinegar-cleaner', 5.25, '2026-09-10'),
  ('bj-disinfecting-wipes-canister', 30.52, '2026-09-10'),
  ('jubilee-bathroom-tissue-large', 16.83, '2026-09-10'),
  ('royal-gelatin-sugar-free', 1.67, '2026-09-10'),
  ('atlantic-salmon-portions', 30.30, '2026-09-10'),
  ('dutch-potatoes-hollandse-aardappelen-2-5kg', 5.88, '2026-09-10'),
  ('whole-mushrooms-16oz', 7.99, '2026-09-10'),
  ('fresh-garlic-250gr', 1.99, '2026-09-10'),
  ('409-sponge-brush', 5.25, '2026-09-10'),
  ('wf-chocolate-chips-granola', 34.73, '2026-09-10'),
  ('folgers-classic-roast-43oz', 69.46, '2026-09-10'),
  ('arm-hammer-advance-white-6oz', 8.94, '2026-09-10'),
  ('listerine-fresh-burst-1lt', 23.15, '2026-09-10'),
  ('co-op-stainless-steel-scour', 4.94, '2026-09-10')
) as v(product_slug, amount, observed_at)
join products p on p.slug = v.product_slug;
