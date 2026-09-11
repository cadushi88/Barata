-- migrations/0017_goisco_fresh_produce_page3.sql
-- Third batch of Goisco fresh produce (page 3 of goisco.com's Fresh Fruits &
-- Vegetables collection, screenshot from 2026-09-11). Three items match
-- existing Papiamento-named FPK-survey produce exactly on real-world
-- item + unit (Yuca, Beetroot/Rooibiet, Okra/Guiambo, all priced per kg) --
-- new price observations only. The rest are new products (new variety or
-- package size vs. anything on file, including the two earlier batches).

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('green-leaf-lettuce-1pc', 'Green Leaf Lettuce', '', 'Produce', '1 pc', null, null),
  ('red-grapes-seedless-1kg', 'Red Grapes, Seedless', '', 'Produce', 'ca. 1 kg', null, null),
  ('cherry-tomatoes-551ml', 'Cherry Tomatoes', '', 'Produce', '551 ml', null, null),
  ('white-grapes-seedless-1kg', 'White Grapes, Seedless', '', 'Produce', 'ca. 1 kg', null, null),
  ('yellow-corn-2pcs', 'Yellow Corn', '', 'Produce', '2 pcs', null, null),
  ('siboyo-largu-green-onion-1ct', 'Siboyo Largu/Green Onion', '', 'Produce', '1 ct', null, null),
  ('passion-fruit-500gr', 'Passion Fruit', '', 'Produce', '500 gr', null, null),
  ('red-delicious-apples-4pcs', 'Red Delicious Apples', '', 'Produce', '4 pcs', null, null),
  ('sweet-vidalia-onions-1kg', 'Sweet Vidalia Onions', '', 'Produce', '1 kg', null, null),
  ('plums-500gr', 'Plums', '', 'Produce', '500 gr', null, null),
  ('grapefruits-2pcs', 'Grapefruits', '', 'Produce', '2 pcs', null, null),
  ('sunbelle-blueberries-170gr', 'Sunbelle Blueberries', '', 'Produce', '170 gr', null, null),
  ('fuji-apples-4pcs', 'Fuji Apples', '', 'Produce', '4 pcs', null, null),
  ('honeydew-melon-1pc', 'Honeydew Melon', '', 'Produce', '1 pc', null, null),
  ('fuik-mint-herbs-20gr', 'Fuik Mint Herbs', '', 'Produce', '20 gr', null, null),
  ('granny-smith-apples-4pcs', 'Granny Smith Apples', '', 'Produce', '4 pcs', null, null),
  ('dutch-potatoes-hollandse-aardappelen-10kg', 'Dutch Potatoes (Hollandse Aardappelen)', '', 'Produce', '10 kg', null, null),
  ('radishes-170gr', 'Radishes', '', 'Produce', '170 gr', null, null),
  ('boston-lettuce-1pc', 'Boston Lettuce', '', 'Produce', '1 pc', null, null),
  ('gala-apples-136kg', 'Gala Apples', '', 'Produce', '1.36 kg', null, null),
  ('yellow-bell-pepper-500gr', 'Yellow Bell Pepper', '', 'Produce', '500 gr', null, null)
on conflict (slug) do nothing;

insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, 'goisco', v.amount, v.observed_at::timestamptz, 'goisco_web'
from (values
  ('green-leaf-lettuce-1pc', 3.67, '2026-09-11'),
  ('red-grapes-seedless-1kg', 11.15, '2026-09-11'),
  ('cherry-tomatoes-551ml', 6.30, '2026-09-11'),
  ('white-grapes-seedless-1kg', 13.95, '2026-09-11'),
  ('yellow-corn-2pcs', 2.99, '2026-09-11'),
  ('siboyo-largu-green-onion-1ct', 1.60, '2026-09-11'),
  ('rooibiet-p-kg', 4.99, '2026-09-11'),
  ('passion-fruit-500gr', 2.49, '2026-09-11'),
  ('red-delicious-apples-4pcs', 4.94, '2026-09-11'),
  ('sweet-vidalia-onions-1kg', 4.99, '2026-09-11'),
  ('plums-500gr', 4.59, '2026-09-11'),
  ('grapefruits-2pcs', 4.94, '2026-09-11'),
  ('guiambo-p-kg', 12.99, '2026-09-11'),
  ('sunbelle-blueberries-170gr', 9.99, '2026-09-11'),
  ('fuji-apples-4pcs', 4.94, '2026-09-11'),
  ('honeydew-melon-1pc', 6.94, '2026-09-11'),
  ('fuik-mint-herbs-20gr', 2.95, '2026-09-11'),
  ('granny-smith-apples-4pcs', 4.94, '2026-09-11'),
  ('dutch-potatoes-hollandse-aardappelen-10kg', 18.94, '2026-09-11'),
  ('radishes-170gr', 1.99, '2026-09-11'),
  ('yuca-p-kg', 2.99, '2026-09-11'),
  ('boston-lettuce-1pc', 3.95, '2026-09-11'),
  ('gala-apples-136kg', 10.52, '2026-09-11'),
  ('yellow-bell-pepper-500gr', 8.99, '2026-09-11')
) as v(product_slug, amount, observed_at)
join products p on p.slug = v.product_slug;
