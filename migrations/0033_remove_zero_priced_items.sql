-- migrations/0033_remove_zero_priced_items.sql
-- 180 products show XCG 0.00 everywhere they're priced -- a bad import
-- (source = 'import') landed a $0.00 observation for them and nothing else
-- ever priced them for real, at any store. A $0 row isn't "cheap," it's
-- broken data: it also silently wins "cheapest" against any real price a
-- product might have, so every $0.00 row is removed regardless of whether
-- its product is one of the 180 -- not just those, in case a real price
-- exists alongside a bad one for some other product.
--
-- Checked before writing this: none of the 180 have an admin-uploaded photo,
-- a user's shopping-list entry, or a pending scraped_prices row pointing at
-- them -- removing them loses nothing else.
--
-- Left untouched: the ~14 products that have simply never been priced at
-- all (no $0.00 row, just no price yet) -- that's a separate, pre-existing
-- situation, not what was asked here.

create temporary table _zero_price_victims as
select p.id from products p
where exists (select 1 from prices pr where pr.product_id = p.id and pr.amount = 0)
  and not exists (select 1 from prices pr2 where pr2.product_id = p.id and pr2.amount > 0);

delete from prices where amount = 0;

delete from scraped_prices where raw_price = 0 and status = 'pending';

delete from products where id in (select id from _zero_price_victims);

drop table _zero_price_victims;
