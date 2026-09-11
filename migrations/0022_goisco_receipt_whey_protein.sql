-- migrations/0022_goisco_receipt_whey_protein.sql
-- Follow-up to 0021: the receipt's "ON GOLD STANDARD WHEY CH" line
-- (Optimum Nutrition Gold Standard Whey, Chocolate) was skipped there for
-- lack of an obvious category -- it fits fine under Pantry alongside other
-- packaged goods. Listed shelf price, not the member discount, matching
-- 0021's convention.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('on-gold-standard-whey-chocolate', 'Gold Standard Whey Chocolate', 'Optimum Nutrition', 'Pantry', '1 tub', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', 105.25, '2026-09-10'::timestamptz, 'receipt'
from products p where p.slug = 'on-gold-standard-whey-chocolate';
