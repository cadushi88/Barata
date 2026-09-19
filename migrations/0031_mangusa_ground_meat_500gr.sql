-- migrations/0031_mangusa_ground_meat_500gr.sql
-- Two real, fixed-weight ground-meat SKUs read directly off Mangusa
-- Hypermarket's own webshop (ahypermarket.com) product pages, provided as
-- screenshots. Distinct from the existing per-kg "Karni Mulá" / "Karni Stoba
-- Mulá" catalog entries (restored from the old FPK survey, unit '1 kg') --
-- these are prepackaged 500gr trays with their own SKUs, not the same
-- product at a different price, so they get their own rows rather than
-- overwriting the per-kg ones.

insert into products (slug, name, category, unit, unit_size, unit_kind) values
  ('onl-stoba-mula-chilled-gem-stoof-vlees-500gr', 'ONL Stoba mula chilled gem stoof vlees 500gr', 'Meat', '500gr', 500, 'g'),
  ('onl-beefstuk-mula-chilled-gemal-biefstuk-500gr', 'ONL Beefstuk mula chilled gemal biefstuk 500gr', 'Meat', '500gr', 500, 'g');

create temporary table _mangusa_500gr_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _mangusa_500gr_prices (slug, raw_name, raw_price) values
  ('onl-stoba-mula-chilled-gem-stoof-vlees-500gr', 'ONL Stoba mula chilled gem stoof vlees 500gr (SKU 0020700700000)', 12.85),
  ('onl-beefstuk-mula-chilled-gemal-biefstuk-500gr', 'ONL Beefstuk mula chilled gemal biefstuk 500gr (SKU 0020700400000)', 16.55);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, observed_at)
select
  'mangusa-hyper', t.raw_name, t.raw_price, p.id, 1, 'pending', 'manual', now()
from _mangusa_500gr_prices t
join products p on p.slug = t.slug;

drop table _mangusa_500gr_prices;
