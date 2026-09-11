-- migrations/0023_goisco_receipt_whey_vanilla.sql
-- Second quality-check pass on the receipt in 0021/0022 (2 independent
-- agents re-transcribed both receipts line by line): the receipt actually
-- has TWO whey protein purchases, not one -- "DN GOLD STANDARD WHEY CH"
-- (Chocolate, added in 0022) and "DN GOLD WHEY PROTEIN VAN" (Vanilla),
-- same price. Everything else on both receipts was confirmed correct
-- against the original 0021 migration.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('on-gold-standard-whey-vanilla', 'Gold Standard Whey Vanilla', 'Optimum Nutrition', 'Pantry', '1 tub', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', 105.25, '2026-09-10'::timestamptz, 'receipt'
from products p where p.slug = 'on-gold-standard-whey-vanilla';
