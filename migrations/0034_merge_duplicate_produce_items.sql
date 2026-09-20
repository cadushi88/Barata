-- migrations/0034_merge_duplicate_produce_items.sql
-- Found while scanning for duplicate catalog items: 5 produce items exist as
-- two separate product rows each, because a Van den Tweel price import
-- (source = 'import', unit left as the generic "each") landed as its own
-- product row instead of matching the item's existing entry from the FPK
-- consumer-price survey (source = 'fpk_survey', unit correctly recorded as
-- "p/kg" or "per stuk").
--
-- Confirmed genuine duplicates, not different pack sizes, two ways:
--   - bloemkool, broccoli and grapefruit each ALSO have (or, for grapefruit,
--     are directly) the "per stuk" unit spelled out on a sibling row, and
--     "each" and "per stuk" (Papiamentu/Dutch "per piece") are the same
--     unit, just in different words.
--   - gember and prei have no "per stuk" sibling, only "p/kg" -- but their
--     one VDT "each" price (13.39 / 12.99) sits right inside the price
--     range other stores report for the SAME item at "p/kg" (12.00-14.25 /
--     10.95-18.99), which a single piece of ginger or one leek would never
--     cost -- confirming "each" was VDT's generic placeholder for "p/kg"
--     here too, not a real distinct per-piece price.
--
-- Every other exact-name-duplicate group found in this same scan (Frisian
-- Flag 410g/400g, Kellogg's 9.6/12/18oz, Quaker 330g/660g, apples/kiwi/
-- mandarin per-kilo vs per-stuk vs N-stuks, etc.) is left alone -- those are
-- genuinely different pack sizes or already-distinct units that only look
-- like duplicates because the shared "name" field doesn't repeat the size.
--
-- Merge = keep the fpk_survey row (better unit label, and in every pair
-- either equal or more price history already), move the VDT import row's
-- price observations onto it so that real, complementary store coverage is
-- combined rather than lost, then remove the now-redundant row. Checked
-- first: none of the 5 removed rows have an admin photo, a shopping-list
-- entry, or a linked scraped_prices row.

update prices set product_id = 10993 where product_id = 9243; -- bloemkool -> bloemkool-per-stuk
update prices set product_id = 10986 where product_id = 9246; -- broccoli -> broccoli-per-stuk
update prices set product_id = 11012 where product_id = 9259; -- grapefruit -> grapefruit-per-stuk
update prices set product_id = 10997 where product_id = 9258; -- gember -> gember-p-kg
update prices set product_id = 10934 where product_id = 9280; -- prei -> prei-p-kg

delete from products where id in (9243, 9246, 9259, 9258, 9280);
