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
  ('tomato-paste',
