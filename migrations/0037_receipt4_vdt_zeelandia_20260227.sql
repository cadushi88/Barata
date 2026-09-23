-- migrations/0037_receipt4_vdt_zeelandia_20260227.sql
-- Transcribed by hand from a photo of a Van den Tweel Zeelandia receipt
-- (Kaya Jacob Posner 28; Trans#126328, Inv#00224640, 2/27/2026 18:49:30)
-- sent directly in chat. All 5 real (non-zero) line items reconcile exactly
-- against the receipt's own printed Total Sales (XCG 77.37) and Item count
-- (15, counting each printed unit: 2 vaatwastabletten + 2 white + 4 puur +
-- 3 melk noot + 2 melk crispy + 1 appeltaart + 1 coupon = 15) -- no discount
-- mechanic on this receipt, so the printed line price is exactly what was
-- charged.
--
-- Left out (both XCG 0.00, not real prices): "AH Roomboter luxe appeltaart"
-- (a free promotional item) and a "Funmiles Verjaardag" birthday coupon
-- (not a product at all).
--
-- Matches: "AH Tablet white", "AH Tablet melk noot" and "AH Melk crispy"
-- are exact existing-catalog matches (same AH product-line naming). "AH
-- Classic vaatwastabletten" does NOT match the catalog's existing "AH
-- Ecologische Vaatwastabletten" -- different AH dishwasher-tablet line, not
-- the same SKU. "AH Puur chocolade" doesn't match either "AH Tablet puur"
-- or "AH Tablet extra puur" confidently enough to pick one over the other,
-- so it's recorded as its own new product rather than guessing.

insert into products (slug, name, category, unit) values
  ('ah-classic-vaatwastabletten', 'AH Classic Vaatwastabletten', 'Household', 'each'),
  ('ah-puur-chocolade', 'AH Puur Chocolade', 'Snacks', 'each');

create temporary table _receipt4_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _receipt4_prices (slug, raw_name, raw_price) values
  ('ah-classic-vaatwastabletten', 'AH Classic vaatwastabletten', 9.69),
  ('ah-tablet-white', 'AH Tablet white', 3.69),
  ('ah-puur-chocolade', 'AH Puur chocolade', 6.09),
  ('ah-tablet-melk-noot', 'AH Tablet melk noot', 6.49),
  ('ah-melk-crispy', 'AH Melk crispy', 3.39);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, user_id, receipt_id, observed_at)
select
  'vdt-zeelandia', t.raw_name, t.raw_price, p.id, 1, 'pending', 'receipt', null, null, '2026-02-27T18:49:30Z'
from _receipt4_prices t
join products p on p.slug = t.slug;

drop table _receipt4_prices;
