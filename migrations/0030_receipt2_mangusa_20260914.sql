-- migrations/0030_receipt2_mangusa_20260914.sql
-- Transcribed by hand from a photo of Mangusa Hypermarket receipt #002-003
-- (Trs #123391, 9/14/2026 14:40) submitted as Barata receipt #2 through the
-- manual-review queue (see submitReceiptForReview). 16 of the receipt's 25
-- lines land here as real observed prices; 9 are deliberately left out:
--   - 7 fresh butcher-counter cuts (pork chop, chicken fillet, ground beef x3,
--     loin ribs, drumstick) print only a flat line total with no "X kg @
--     Y/kg" rate above them, unlike the produce lines here that do -- meaning
--     they're pre-weighed, barcode-priced packages, not a stable per-kg rate.
--     Recording their totals as "the price" would be misleading (three
--     different-sized ground-beef packages on this one receipt alone priced
--     6.02, 4.79 and 5.94 -- not the same thing as a per-kg price).
--   - Baby spinazie (usa) likewise has a flat total with no weight basis.
--   - One line (a 6-pack of hot dogs) has a pen mark over part of its price
--     in the photo and isn't reliably legible.
-- 10 new products are added for items with no existing catalog match; 6 lines
-- matched existing scraped-catalog products directly.
--
-- receipts.id = 2 only exists in the real database this receipt was actually
-- submitted to -- a fresh replay (local dev, preview, this migration's own
-- test run) has no such row. The left join + the plain UPDATE below both
-- degrade to "receipt link left null" / "0 rows updated" in that case rather
-- than erroring, so the price data (the actual point of this migration)
-- lands regardless of which database applies it.

insert into products (slug, name, category, unit, unit_size, unit_kind) values
  ('spekblokjes-p-kg', 'Spekblokjes', 'Meat', 'p/kg', null, null),
  ('siboyo-hulandes-p-kg', 'Siboyo Hulandes', 'Produce', 'p/kg', null, null),
  ('batata-dushi-oranjo-p-kg', 'Batata Dushi Oranjo', 'Produce', 'p/kg', null, null),
  ('promenton-berde-usa-p-kg', 'Promenton Berde USA', 'Produce', 'p/kg', null, null),
  ('zwan-kip-rookworsten-250g', 'Zwan Kip Rookworsten 250g', 'Meat', '250g', 250, 'g'),
  ('blue-ribbon-parboil-rice', 'Blue Ribbon Parboiled Rice', 'Pantry', 'each', null, null),
  ('colgate-maxfresh-knockout', 'Colgate Maxfresh Knockout', 'Household', 'each', null, null),
  ('tarwe-brood-half', 'Tarwe Brood Half', 'Bakery', 'each', null, null),
  ('crest-fluoride-anticavity', 'Crest Fluoride Anticavity', 'Household', 'each', null, null),
  ('wisdom-step-by-step-toothbrush', 'Wisdom Step by Step Toothbrush', 'Household', 'each', null, null);

create temporary table _receipt2_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _receipt2_prices (slug, raw_name, raw_price) values
  ('zwan-kip-rookworsten-250g', 'Zwan kip rookworsten 250g', 7.25),
  ('spekblokjes-p-kg', 'Spekblokjes kl', 22.5),
  ('gwaltney-chicken-franks-16-oz', 'Gwaltney chick franks16oz', 5.25),
  ('citroen-p-kg', 'Citroen usa kl', 8.95),
  ('siboyo-hulandes-p-kg', 'Siboyo hulandes 1kg', 2.35),
  ('batata-dushi-oranjo-p-kg', 'Batata dushi oranjo kl', 5.5),
  ('promenton-berde-usa-p-kg', 'Promenton berde usa kl', 5.95),
  ('wortel-jumbo-p-kg', 'Wortel jumbo usa kl', 4.25),
  ('presto-pasta-cornetti-rigati-400gr', 'Presto pasta cornetti rig', 2.15),
  ('blue-ribbon-parboil-rice', 'Blue ribbon parboil rice', 8.69),
  ('baldom-ajo-en-pasta-8-0oz', 'Baldom ajo pasta 8.0oz', 5.45),
  ('familia-toilet-paper-3ply-green-9pc', 'Familia toilet paper 9pc', 17.2),
  ('tarwe-brood-half', 'Tarwe brood half 1pc', 1.83),
  ('crest-fluoride-anticavity', 'Crest fluor antic spiderm', 6.05),
  ('colgate-maxfresh-knockout', 'Colgate maxfresh knockout', 15.15),
  ('wisdom-step-by-step-toothbrush', 'Wisdom step by step tooth', 6.1);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, user_id, receipt_id, observed_at)
select
  'mangusa-hyper', t.raw_name, t.raw_price, p.id, 1, 'pending', 'receipt', r.user_id, r.id, '2026-09-14T12:00:00Z'
from _receipt2_prices t
join products p on p.slug = t.slug
left join (select id, user_id from receipts where id = 2) r on true;

drop table _receipt2_prices;

update receipts
set
  store_id = 'mangusa-hyper',
  status = 'pending_review',
  purchase_date = '2026-09-14',
  photo_data = null,
  photo_content_type = null,
  parsed = jsonb_build_object(
    'storeGuess', 'Mangusa Hypermarket',
    'purchaseDate', '2026-09-14',
    'items', (
      select jsonb_agg(x) from (values
      (jsonb_build_object('name', 'Zwan kip rookworsten 250g', 'amount', 7.25, 'productId', (select id from products where slug = 'zwan-kip-rookworsten-250g'), 'published', true)),
      (jsonb_build_object('name', 'Spekblokjes kl', 'amount', 22.5, 'productId', (select id from products where slug = 'spekblokjes-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Gwaltney chick franks16oz', 'amount', 5.25, 'productId', (select id from products where slug = 'gwaltney-chicken-franks-16-oz'), 'published', true)),
      (jsonb_build_object('name', 'Citroen usa kl', 'amount', 8.95, 'productId', (select id from products where slug = 'citroen-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Siboyo hulandes 1kg', 'amount', 2.35, 'productId', (select id from products where slug = 'siboyo-hulandes-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Batata dushi oranjo kl', 'amount', 5.5, 'productId', (select id from products where slug = 'batata-dushi-oranjo-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Promenton berde usa kl', 'amount', 5.95, 'productId', (select id from products where slug = 'promenton-berde-usa-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Wortel jumbo usa kl', 'amount', 4.25, 'productId', (select id from products where slug = 'wortel-jumbo-p-kg'), 'published', true)),
      (jsonb_build_object('name', 'Presto pasta cornetti rig', 'amount', 2.15, 'productId', (select id from products where slug = 'presto-pasta-cornetti-rigati-400gr'), 'published', true)),
      (jsonb_build_object('name', 'Blue ribbon parboil rice', 'amount', 8.69, 'productId', (select id from products where slug = 'blue-ribbon-parboil-rice'), 'published', true)),
      (jsonb_build_object('name', 'Baldom ajo pasta 8.0oz', 'amount', 5.45, 'productId', (select id from products where slug = 'baldom-ajo-en-pasta-8-0oz'), 'published', true)),
      (jsonb_build_object('name', 'Familia toilet paper 9pc', 'amount', 17.2, 'productId', (select id from products where slug = 'familia-toilet-paper-3ply-green-9pc'), 'published', true)),
      (jsonb_build_object('name', 'Tarwe brood half 1pc', 'amount', 1.83, 'productId', (select id from products where slug = 'tarwe-brood-half'), 'published', true)),
      (jsonb_build_object('name', 'Crest fluor antic spiderm', 'amount', 6.05, 'productId', (select id from products where slug = 'crest-fluoride-anticavity'), 'published', true)),
      (jsonb_build_object('name', 'Colgate maxfresh knockout', 'amount', 15.15, 'productId', (select id from products where slug = 'colgate-maxfresh-knockout'), 'published', true)),
      (jsonb_build_object('name', 'Wisdom step by step tooth', 'amount', 6.1, 'productId', (select id from products where slug = 'wisdom-step-by-step-toothbrush'), 'published', true)),
      (jsonb_build_object('name', 'Porkchop sin wesu ku vet', 'amount', 6.35, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Fillet galiña mula ch kl', 'amount', 3.97, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Karni mula ch kl', 'amount', 6.02, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Karni mula ch kl', 'amount', 4.79, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Karni mula ch kl', 'amount', 5.94, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Loin ribs fr pa smor kl', 'amount', 9.83, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Drumstick ch kl', 'amount', 4.14, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Baby spinazie usa kl', 'amount', 4.09, 'productId', null, 'published', false)),
      (jsonb_build_object('name', 'Hotdog 6pc', 'amount', null, 'productId', null, 'published', false))
      ) as t(x)
    )
  )
where id = 2;
