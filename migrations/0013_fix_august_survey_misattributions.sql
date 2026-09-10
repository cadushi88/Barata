-- migrations/0013_fix_august_survey_misattributions.sql
--
-- Data-integrity fixes found auditing migrations 0003-0012.
--
-- 1. 76 August-2026 price observations landed on the wrong catalog product.
--    FPK's August survey lists several products twice, once per pack size
--    (Quaker Instant 330 gr AND 660 gr, Coca Cola / Fria 1 ltr AND 2 ltr, ...).
--    The 0012 import wrote BOTH size blocks under the SMALLER size's slug, so
--    the small pack got two prices per store on 2026-08-15 -- one real, one
--    roughly double -- while the large pack silently got none. The give-away is
--    that each stranded block's price range matches the large pack's own April
--    2026 range almost exactly (e.g. Quaker Instant 660 gr: April 12.00-16.50,
--    stranded August block 12.00-16.50), and that each stranded block sits at
--    the large pack's position in the survey's row order. Kwidzyn is the same
--    bug across product type rather than size: the survey's doperwten (green
--    peas) block was written under 'kwidzyn-400-gr' (whole kernel corn, which
--    0011 had just re-identified) instead of 'kwidzyn-doperwten-400-gr'; that
--    block sits between the Sapac and Gwoon doperwten rows in the source order.
--
--    Each row is moved by its exact (wrong slug, store, amount) triple rather
--    than by "the higher of the two", because the Kwidzyn blocks interleave.
--    The move is skipped when the destination already holds an observation for
--    that store and date, which makes re-applying this file a no-op.
--
-- 2. Two products exist twice in the catalog under different slugs: the 0003
--    seed entry and a byte-identical re-import (0012 for Sirloin Steak, whose
--    survey name matches the seed's name exactly, and Mango, whose "per kilo"
--    unit is the same unit as the seed's "1 kg"). Their price history is split
--    across the two rows, so neither shows the real trend. The seed slug wins:
--    it is older, carries unit_size/unit_kind that the newer row leaves null,
--    and is the key src/lib/product-photo.ts maps a photo to.
--
-- 3. Leading/trailing/repeated whitespace in products.name and products.unit
--    carried over from the source spreadsheet, which splits what should be one
--    unit string in two ("5 lbs " vs "5 lbs", "2 lbs " vs "2 lbs"), and one
--    stray decimal point in a unit ("18. oz").

-- 1. Re-attach the stranded August 2026 price blocks to the right product.
with moves(wrong_slug, right_slug, store_id, amount) as (values
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'best-buy', 3.05),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'bonbini', 2.47),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'boulevard-marketplace', 3.85),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'carrefour', 2.73),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'timmy', 2.55),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'esperamos', 2.82),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'mangusa-rio', 2.45),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'mangusa-hyper', 2.45),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'ruyterkade', 2.75),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'vreugdenhil', 2.72),
    ('kwidzyn-400-gr', 'kwidzyn-doperwten-400-gr', 'lunapark', 2.95),
    ('gold-medal-all-purpose-5-lbs', 'gold-medal-all-purpose-12-lbs', 'boulevard-marketplace', 32.65),
    ('gold-medal-all-purpose-5-lbs', 'gold-medal-all-purpose-12-lbs', 'carrefour', 29.19),
    ('gold-medal-all-purpose-5-lbs', 'gold-medal-all-purpose-12-lbs', 'mangusa-rio', 28.35),
    ('gold-medal-all-purpose-5-lbs', 'gold-medal-all-purpose-12-lbs', 'mangusa-hyper', 28.35),
    ('badia-extra-virgin-250-ml', 'badia-extra-virgin-500-ml', 'bonbini', 34.82),
    ('badia-extra-virgin-250-ml', 'badia-extra-virgin-500-ml', 'centrum-mahaai', 30.58),
    ('badia-extra-virgin-250-ml', 'badia-extra-virgin-500-ml', 'centrum-piscadera', 30.58),
    ('badia-extra-virgin-250-ml', 'badia-extra-virgin-500-ml', 'carrefour', 35.51),
    ('badia-extra-virgin-250-ml', 'badia-extra-virgin-500-ml', 'vreugdenhil', 35.37),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'vdt-zeelandia', 15.69),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'best-buy', 15.25),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'bonbini', 12),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'boulevard-marketplace', 15.99),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'centrum-mahaai', 13.88),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'centrum-piscadera', 13.88),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'carrefour', 15.4),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'timmy', 14.85),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'esperamos', 14.4),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'mangusa-rio', 13.1),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'mangusa-hyper', 13.1),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'ruyterkade', 16.5),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'vreugdenhil', 13.72),
    ('quaker-quick-cooking-330-gr', 'quaker-quick-cooking-660-gr', 'lunapark', 15.95),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'vdt-zeelandia', 15.69),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'best-buy', 15.45),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'bonbini', 12),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'boulevard-marketplace', 15.99),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'centrum-mahaai', 13.88),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'centrum-piscadera', 13.88),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'carrefour', 15.38),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'timmy', 14.85),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'esperamos', 14.4),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'mangusa-rio', 13.1),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'mangusa-hyper', 13.1),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'ruyterkade', 16.5),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'vreugdenhil', 13.72),
    ('quaker-instant-330-gr', 'quaker-instant-660-gr', 'lunapark', 15.95),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'vdt-zeelandia', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'best-buy', 9.57),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'bonbini', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'boulevard-marketplace', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'centrum-mahaai', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'centrum-piscadera', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'carrefour', 10),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'timmy', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'esperamos', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'mangusa-rio', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'mangusa-hyper', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'ruyterkade', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'vreugdenhil', 9.58),
    ('frisian-flag-410-gr', 'frisian-flag-400-gr', 'lunapark', 9.58),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'vdt-zeelandia', 6.9),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'best-buy', 6.99),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'bonbini', 6.9),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'boulevard-marketplace', 7.95),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'centrum-mahaai', 6.65),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'centrum-piscadera', 6.65),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'carrefour', 6.94),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'timmy', 6.97),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'esperamos', 6.95),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'mangusa-rio', 6.9),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'mangusa-hyper', 6.9),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'ruyterkade', 8.5),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'vreugdenhil', 7.08),
    ('coca-cola-fria-lokal-1-ltr', 'coca-cola-fria-lokal-2-ltr', 'lunapark', 6.95)
),
-- One row per (wrong product, store): when both survey blocks recorded the same
-- amount at the same store, either physical row will do.
picked as (
  select distinct on (wrong.id, m.store_id) pr.id as price_id, right_p.id as new_product_id
  from moves m
  join products wrong on wrong.slug = m.wrong_slug
  join products right_p on right_p.slug = m.right_slug
  join prices pr
    on pr.product_id = wrong.id
   and pr.store_id = m.store_id
   and pr.observed_at::date = date '2026-08-15'
   and pr.amount = m.amount::numeric(10,2)
  where not exists (
    select 1 from prices done
    where done.product_id = right_p.id
      and done.store_id = m.store_id
      and done.observed_at::date = date '2026-08-15'
  )
  order by wrong.id, m.store_id, pr.id desc
)
update prices set product_id = picked.new_product_id
from picked where prices.id = picked.price_id;

-- 2a. Merge 'sirloin-steak-1-kg' (0012) into the seed's 'sirloin'.
update prices set product_id = (select id from products where slug = 'sirloin')
where product_id = (select id from products where slug = 'sirloin-steak-1-kg');

update shopping_list sl set product_id = (select id from products where slug = 'sirloin')
where sl.product_id = (select id from products where slug = 'sirloin-steak-1-kg')
  and not exists (
    select 1 from shopping_list keep
    where keep.user_id = sl.user_id
      and keep.product_id = (select id from products where slug = 'sirloin')
  );

delete from products where slug = 'sirloin-steak-1-kg';

-- 2b. Merge 'mango-per-kilo' (0012) into the seed's 'mango'.
update prices set product_id = (select id from products where slug = 'mango')
where product_id = (select id from products where slug = 'mango-per-kilo');

update shopping_list sl set product_id = (select id from products where slug = 'mango')
where sl.product_id = (select id from products where slug = 'mango-per-kilo')
  and not exists (
    select 1 from shopping_list keep
    where keep.user_id = sl.user_id
      and keep.product_id = (select id from products where slug = 'mango')
  );

delete from products where slug = 'mango-per-kilo';

-- 3. Normalise whitespace in product names and unit strings, so that units that
--    are the same string except for a stray space stop counting as two units.
update products set name = regexp_replace(btrim(name), '[ \t]{2,}', ' ', 'g')
where name <> regexp_replace(btrim(name), '[ \t]{2,}', ' ', 'g');

update products set unit = regexp_replace(btrim(unit), '[ \t]{2,}', ' ', 'g')
where unit <> regexp_replace(btrim(unit), '[ \t]{2,}', ' ', 'g');

-- Stray decimal point imported with the pack size; its two siblings are
-- '9.6 oz' and '12 oz'.
update products set unit = '18 oz' where slug = 'kellog-s-18-oz' and unit = '18. oz';
