-- migrations/0006_fpk_survey_prices.sql
-- Real prices from Fundashon pa Konsumido's public supermarket/minimarket survey,
-- conducted April 13-17, 2026 across 15 stores (fundashonpakonsumido.cw).
-- Only inserted for stores already in our catalog with an unambiguous match.
insert into prices (product_id, store_id, amount, observed_at, source)
select p.id, v.store_id, v.amount, v.observed_at::timestamptz, 'fpk_survey'
from (values
  ('beans-can', 'bonbini', 4.76, '2026-04-15'),
  ('beans-can', 'vreugdenhil', 4.39, '2026-04-15'),
  ('rice-1kg', 'bonbini', 2.79, '2026-04-15'),
  ('rice-1kg', 'centrum-mahaai', 2.79, '2026-04-15'),
  ('rice-1kg', 'centrum-piscadera', 2.79, '2026-04-15'),
  ('rice-1kg', 'carrefour', 2.39, '2026-04-15'),
  ('rice-1kg', 'esperamos', 2.79, '2026-04-15'),
  ('rice-1kg', 'mangusa-rio', 2.79, '2026-04-15'),
  ('rice-1kg', 'mangusa-hyper', 2.79, '2026-04-15'),
  ('rice-1kg', 'vreugdenhil', 2.79, '2026-04-15'),
  ('oil-1l', 'bonbini', 12.06, '2026-04-15'),
  ('oil-1l', 'centrum-mahaai', 13.28, '2026-04-15'),
  ('oil-1l', 'centrum-piscadera', 13.28, '2026-04-15'),
  ('oil-1l', 'carrefour', 13.89, '2026-04-15'),
  ('oil-1l', 'mangusa-rio', 12.1, '2026-04-15'),
  ('oil-1l', 'mangusa-hyper', 12.1, '2026-04-15'),
  ('oil-1l', 'vreugdenhil', 13.83, '2026-04-15'),
  ('tomato-paste', 'bonbini', 3.18, '2026-04-15'),
  ('tomato-paste', 'centrum-mahaai', 3.2, '2026-04-15'),
  ('tomato-paste', 'centrum-piscadera', 3.2, '2026-04-15'),
  ('tomato-paste', 'carrefour', 3.36, '2026-04-15'),
  ('tomato-paste', 'esperamos', 3.29, '2026-04-15'),
  ('tomato-paste', 'mangusa-rio', 3.2, '2026-04-15'),
  ('tomato-paste', 'mangusa-hyper', 3.2, '2026-04-15'),
  ('tomato-paste', 'vreugdenhil', 3.7, '2026-04-15'),
  ('sugar-1kg', 'bonbini', 3.67, '2026-04-15'),
  ('sugar-1kg', 'centrum-mahaai', 3.63, '2026-04-15'),
  ('sugar-1kg', 'centrum-piscadera', 3.63, '2026-04-15'),
  ('sugar-1kg', 'carrefour', 4.24, '2026-04-15'),
  ('sugar-1kg', 'esperamos', 3.79, '2026-04-15'),
  ('sugar-1kg', 'vreugdenhil', 4.05, '2026-04-15'),
  ('tea-20', 'bonbini', 3.25, '2026-04-15'),
  ('tea-20', 'centrum-mahaai', 3.25, '2026-04-15'),
  ('tea-20', 'centrum-piscadera', 3.25, '2026-04-15'),
  ('tea-20', 'esperamos', 3.5, '2026-04-15'),
  ('tea-20', 'mangusa-rio', 3.25, '2026-04-15'),
  ('tea-20', 'mangusa-hyper', 3.25, '2026-04-15'),
  ('tea-20', 'vreugdenhil', 3.25, '2026-04-15'),
  ('coffee-250', 'carrefour', 10.33, '2026-04-15'),
  ('coffee-250', 'esperamos', 10.15, '2026-04-15'),
  ('coffee-250', 'mangusa-rio', 9.8, '2026-04-15'),
  ('coffee-250', 'mangusa-hyper', 9.8, '2026-04-15'),
  ('soap', 'bonbini', 3.85, '2026-04-15'),
  ('soap', 'esperamos', 3.26, '2026-04-15'),
  ('soap', 'mangusa-rio', 3.75, '2026-04-15'),
  ('soap', 'mangusa-hyper', 3.75, '2026-04-15'),
  ('soap', 'vreugdenhil', 4.05, '2026-04-15'),
  ('tp', 'bonbini', 10.4, '2026-04-15'),
  ('tp', 'centrum-mahaai', 10.18, '2026-04-15'),
  ('tp', 'centrum-piscadera', 10.18, '2026-04-15'),
  ('tp', 'esperamos', 11.08, '2026-04-15'),
  ('tp', 'mangusa-rio', 10.8, '2026-04-15'),
  ('tp', 'mangusa-hyper', 10.8, '2026-04-15'),
  ('tp', 'vreugdenhil', 11.04, '2026-04-15')
) as v(slug, store_id, amount, observed_at)
join products p on p.slug = v.slug;

-- Correct Goisco's address using the real store receipt (Schottegatweg Noord 24),
-- since the original seed data had it wrong (Zuikertuintje).
update stores set address = 'Schottegatweg Noord 24, Willemstad', area = 'Schottegatweg Noord'
where id = 'goisco';
