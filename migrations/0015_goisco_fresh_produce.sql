-- migrations/0015_goisco_fresh_produce.sql
-- First price observations for Goisco (store added in 0005 but never priced):
-- 24 items from goisco.com's "Fresh Fruits & Vegetables" collection, read off a
-- screenshot of the live page on 2026-09-11. 6 already match existing generic
-- Produce items exactly on name+unit (limes, bananas, avocado, cucumber,
-- broccoli-per-stuk, kropsla-per-stuk); the other 18 are new products, mostly
-- because Goisco's unit/size or named variety doesn't match anything on file.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('mandarines-500gr', 'Mandarines', '', 'Produce', '500 gr', null, null),
  ('green-bell-pepper-500gr', 'Green Bell Pepper', '', 'Produce', '500 gr', null, null),
  ('celery-1pc', 'Celery', '', 'Produce', '1 pc', null, null),
  ('ripe-plantain-1pc', 'Ripe Plantain', '', 'Produce', '1 pc', null, null),
  ('plum-tomatoes-roma-1kg', 'Plum Tomatoes (Roma)', '', 'Produce', '1 kg', null, null),
  ('garlic-5pcs', 'Garlic', '', 'Produce', '5 pcs', null, null),
  ('sweet-potatoes-batata-dushi-1kg', 'Sweet Potatoes (Batata Dushi)', '', 'Produce', '1 kg', null, null),
  ('cilantro-herb-50gr', 'Cilantro Herb', '', 'Produce', '50 gr', null, null),
  ('lemons-fancy-500gr', 'Lemons, Fancy', '', 'Produce', '500 gr', null, null),
  ('dutch-potatoes-hollandse-aardappelen-2-5kg', 'Dutch Potatoes (Hollandse Aardappelen)', '', 'Produce', 'ca. 2.5 kg', null, null),
  ('green-plantain-1pc', 'Green Plantain', '', 'Produce', '1 pc', null, null),
  ('ginger-500gr', 'Ginger', '', 'Produce', '500 gr', null, null),
  ('oranges-1pc', 'Oranges', '', 'Produce', '1 pc', null, null),
  ('carrots-454gr', 'Carrots', '', 'Produce', '454 gr', null, null),
  ('zucchini-2pcs', 'Zucchini', '', 'Produce', '2 pcs', null, null),
  ('kiwis-500gr', 'Kiwi''s', '', 'Produce', '500 gr', null, null),
  ('cauliflower-1pc', 'Cauliflower', '', 'Produce', '1 pc', null, null),
  ('white-onions-1kg', 'White Onions', '', 'Produce', '1 kg', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', v.amount, v.observed_at::timestamptz, 'goisco_web'
from (values
  ('lime', 4.52, '2026-09-11'),
  ('bananas', 3.25, '2026-09-11'),
  ('avocado', 4.94, '2026-09-11'),
  ('mandarines-500gr', 5.88, '2026-09-11'),
  ('cucumber', 2.41, '2026-09-11'),
  ('green-bell-pepper-500gr', 5.88, '2026-09-11'),
  ('celery-1pc', 1.99, '2026-09-11'),
  ('broccoli-per-stuk', 5.29, '2026-09-11'),
  ('ripe-plantain-1pc', 0.99, '2026-09-11'),
  ('plum-tomatoes-roma-1kg', 4.20, '2026-09-11'),
  ('garlic-5pcs', 1.99, '2026-09-11'),
  ('sweet-potatoes-batata-dushi-1kg', 3.36, '2026-09-11'),
  ('cilantro-herb-50gr', 2.94, '2026-09-11'),
  ('kropsla-per-stuk', 4.94, '2026-09-11'),
  ('lemons-fancy-500gr', 3.99, '2026-09-11'),
  ('dutch-potatoes-hollandse-aardappelen-2-5kg', 5.88, '2026-09-11'),
  ('green-plantain-1pc', 0.99, '2026-09-11'),
  ('ginger-500gr', 14.73, '2026-09-11'),
  ('oranges-1pc', 0.52, '2026-09-11'),
  ('carrots-454gr', 1.65, '2026-09-11'),
  ('zucchini-2pcs', 3.29, '2026-09-11'),
  ('kiwis-500gr', 4.39, '2026-09-11'),
  ('cauliflower-1pc', 5.25, '2026-09-11'),
  ('white-onions-1kg', 3.99, '2026-09-11')
) as v(product_slug, amount, observed_at)
join products p on p.slug = v.product_slug;
