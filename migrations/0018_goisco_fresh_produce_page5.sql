-- migrations/0018_goisco_fresh_produce_page5.sql
-- Fourth batch of Goisco fresh produce -- page 5 (the last page) of
-- goisco.com's Fresh Fruits & Vegetables collection, screenshot from
-- 2026-09-11. Page 4 was not captured and is not included here. All 13
-- items are new products (no exact name+unit match on file, including the
-- Fuik-branded herb line started in 0017's "Fuik Mint Herbs").

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('fuik-romero-herbs-20gr', 'Fuik Romero Herbs', '', 'Produce', '20 gr', null, null),
  ('fuik-lemongrass-herbs-20gr', 'Fuik Lemongrass Herbs', '', 'Produce', '20 gr', null, null),
  ('fuik-cilantro-herbs-20gr', 'Fuik Cilantro Herbs', '', 'Produce', '20 gr', null, null),
  ('habanero-peppers-promenton-pika-500gr', 'Habanero Peppers (Promente Pika)', '', 'Produce', '500 gr', null, null),
  ('red-globe-grapes-1kg', 'Red Globe Grapes', '', 'Produce', 'ca. 1 kg', null, null),
  ('fresh-garlic-1kg', 'Fresh Garlic', '', 'Produce', '1 kg', null, null),
  ('napa-cabbage-1pc', 'Napa Cabbage', '', 'Produce', '1 pc', null, null),
  ('romaine-lettuce-hearts-3ct', 'Romaine Lettuce Hearts', '', 'Produce', '3 ct', null, null),
  ('little-orange-lulo-naranjilla-500gr', 'Little Orange (Lulo Naranjilla)', '', 'Produce', '500 gr', null, null),
  ('tamarind-500gr', 'Tamarind', '', 'Produce', '500 gr', null, null),
  ('green-onions-10oz', 'Green Onions', '', 'Produce', '10 oz', null, null),
  ('savoy-cabbage-1pc', 'Savoy Cabbage', '', 'Produce', '1 pc', null, null),
  ('artichoke-2pcs', 'Artichoke', '', 'Produce', '2 pcs', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', v.amount, v.observed_at::timestamptz, 'goisco_web'
from (values
  ('fuik-romero-herbs-20gr', 2.95, '2026-09-11'),
  ('fuik-lemongrass-herbs-20gr', 2.95, '2026-09-11'),
  ('fuik-cilantro-herbs-20gr', 2.95, '2026-09-11'),
  ('habanero-peppers-promenton-pika-500gr', 7.99, '2026-09-11'),
  ('red-globe-grapes-1kg', 12.05, '2026-09-11'),
  ('fresh-garlic-1kg', 16.95, '2026-09-11'),
  ('napa-cabbage-1pc', 7.99, '2026-09-11'),
  ('romaine-lettuce-hearts-3ct', 7.99, '2026-09-11'),
  ('little-orange-lulo-naranjilla-500gr', 2.99, '2026-09-11'),
  ('tamarind-500gr', 7.99, '2026-09-11'),
  ('green-onions-10oz', 3.78, '2026-09-11'),
  ('savoy-cabbage-1pc', 5.49, '2026-09-11'),
  ('artichoke-2pcs', 6.94, '2026-09-11')
) as v(product_slug, amount, observed_at)
join products p on p.slug = v.product_slug;
