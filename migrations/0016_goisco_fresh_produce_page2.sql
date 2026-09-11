-- migrations/0016_goisco_fresh_produce_page2.sql
-- Second batch of Goisco fresh produce (page 2 of goisco.com's Fresh Fruits &
-- Vegetables collection, screenshot from 2026-09-11). All 24 items are new
-- products -- each differs from anything already on file (including the
-- first batch in 0015) by variety or package size, e.g. two separate Dutch
-- Potatoes sizes (ca. 2.5 kg vs ca. 5 kg) and two separate red onion listings
-- (900 gr vs "Medium" 1 kg).

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('round-tomatoes-1kg', 'Round Tomatoes', '', 'Produce', '1 kg', null, null),
  ('red-seedless-grapes-500gr', 'Red Seedless Grapes', '', 'Produce', '500 gr', null, null),
  ('watermelon-patia-1pc', 'Watermelon (Patia)', '', 'Produce', '1 pc', null, null),
  ('papaya-1pc', 'Papaya', '', 'Produce', '1 pc', null, null),
  ('carrots-900gr', 'Carrots', '', 'Produce', '900 gr', null, null),
  ('pumpkin-1pc', 'Pumpkin', '', 'Produce', '1 pc', null, null),
  ('cantaloupe-melon-1pc', 'Cantaloupe Melon', '', 'Produce', '1 pc', null, null),
  ('red-onions-900gr', 'Red Onions', '', 'Produce', '900 gr', null, null),
  ('red-bell-pepper-500gr', 'Red Bell Pepper', '', 'Produce', '500 gr', null, null),
  ('mango-500gr', 'Mango', '', 'Produce', '500 gr', null, null),
  ('yellow-onions-3lb', 'Yellow Onions', '', 'Produce', '3 LB', null, null),
  ('spinach-280gr', 'Spinach', '', 'Produce', 'ca. 280 gr', null, null),
  ('idaho-potatoes-1kg', 'Idaho Potatoes', '', 'Produce', '1 kg', null, null),
  ('leek-prei-1pc', 'Leek (Prei)', '', 'Produce', '1 pc', null, null),
  ('green-asparagus-500gr', 'Green Asparagus', '', 'Produce', '500 gr', null, null),
  ('white-grapes-500gr', 'White Grapes', '', 'Produce', '500 gr', null, null),
  ('dutch-potatoes-hollandse-aardappelen-5kg', 'Dutch Potatoes (Hollandse Aardappelen)', '', 'Produce', 'ca. 5 kg', null, null),
  ('red-onions-medium-1kg', 'Red Onions, Medium', '', 'Produce', '1 kg', null, null),
  ('kale-boerenkool-500gr', 'Kale (Boerenkool)', '', 'Produce', '500 gr', null, null),
  ('fuji-apples-2lbs', 'Fuji Apples', '', 'Produce', '2 lbs', null, null),
  ('mushrooms-whole-453gr', 'Country Fresh Whole Mushrooms', '', 'Produce', '453 gr', null, null),
  ('baby-carrots-peeled-1lbs', 'Baby Carrots, Peeled', '', 'Produce', '1 lbs', null, null),
  ('romaine-lettuce-1pc', 'Romaine Lettuce', '', 'Produce', '1 pc', null, null),
  ('green-cabbage-1pc', 'Green Cabbage', '', 'Produce', '1 pc', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', v.amount, v.observed_at::timestamptz, 'goisco_web'
from (values
  ('round-tomatoes-1kg', 5.95, '2026-09-11'),
  ('red-seedless-grapes-500gr', 5.99, '2026-09-11'),
  ('watermelon-patia-1pc', 21.00, '2026-09-11'),
  ('papaya-1pc', 4.94, '2026-09-11'),
  ('carrots-900gr', 5.25, '2026-09-11'),
  ('pumpkin-1pc', 5.49, '2026-09-11'),
  ('cantaloupe-melon-1pc', 5.99, '2026-09-11'),
  ('red-onions-900gr', 5.99, '2026-09-11'),
  ('red-bell-pepper-500gr', 8.99, '2026-09-11'),
  ('mango-500gr', 2.19, '2026-09-11'),
  ('yellow-onions-3lb', 6.52, '2026-09-11'),
  ('spinach-280gr', 5.57, '2026-09-11'),
  ('idaho-potatoes-1kg', 3.95, '2026-09-11'),
  ('leek-prei-1pc', 2.99, '2026-09-11'),
  ('green-asparagus-500gr', 6.94, '2026-09-11'),
  ('white-grapes-500gr', 5.99, '2026-09-11'),
  ('dutch-potatoes-hollandse-aardappelen-5kg', 11.57, '2026-09-11'),
  ('red-onions-medium-1kg', 5.57, '2026-09-11'),
  ('kale-boerenkool-500gr', 2.49, '2026-09-11'),
  ('fuji-apples-2lbs', 8.94, '2026-09-11'),
  ('mushrooms-whole-453gr', 6.99, '2026-09-11'),
  ('baby-carrots-peeled-1lbs', 3.95, '2026-09-11'),
  ('romaine-lettuce-1pc', 4.52, '2026-09-11'),
  ('green-cabbage-1pc', 5.49, '2026-09-11')
) as v(product_slug, amount, observed_at)
join products p on p.slug = v.product_slug;
