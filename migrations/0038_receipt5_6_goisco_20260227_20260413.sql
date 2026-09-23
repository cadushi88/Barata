-- migrations/0038_receipt5_6_goisco_20260227_20260413.sql
-- Transcribed by hand from photos of two separate Goisco Wholesale Club
-- receipts (Schottegatweg Noord 24, Willemstad), sent together in chat:
--   - Trans#116281, Inv#00113842, 4/13/2026 18:04:36 (12 items, 1 photo)
--   - Trans#576000, Inv#00548114, 2/27/2026 18:10:53 (54 items, 2 photos
--     covering top and bottom of one long receipt, with the fruit-produce
--     section duplicated across both photos and used to confirm the join)
-- Combined into one migration (same store, and 2 products -- Awakati
-- Avocado and Coca Cola Zero 12x12oz -- are bought on both visits) rather
-- than two, to avoid splitting one product's inserts across files.
--
-- Goisco's discount mechanic, confirmed by reconciling both receipts'
-- totals to the penny: "Items Subtotal" is the sum of raw printed line
-- prices; a per-line "Customer discount" (running ~7% on nearly every line
-- -- consistent with a wholesale-club member-pricing rate, not a one-off
-- personal coupon) is then subtracted, along with one whole-receipt
-- "Global discount", to reach the printed Subtotal/Total actually paid
-- (Items Subtotal 1037.56 - Customer discount 68.39 - Global discount 9.07
-- = 960.10 = Total, exact; the smaller receipt is off by 1 cent on
-- rounding only: 333.15 - 22.65 - 3.01 = 307.49 vs printed 307.48). So
-- every raw_price below is the NET price actually paid (printed line price
-- minus its own printed "Customer discount"), not the pre-discount shelf
-- price. Two lines ("Happy Cat Minkas Perfect", "Coop Non-Bio Laundry
-- Powd") show a "Markdown" instead of a "Customer discount" -- like the
-- Centrum receipt's Alpro markdown, that's already baked into the printed
-- line price and not separately subtracted, so those are recorded as
-- printed.
--
-- Left out entirely:
--   - "Atlantic Salmon Portions": appears on both receipts, and on the
--     4/13 receipt two units in the SAME transaction ring up at two
--     different totals (32.83 and 31.49) with no printed weight/rate
--     breakdown -- proof this is a variable-weight item, not a stable
--     per-unit price, so no instance of it (either receipt) is recorded,
--     same reasoning as the Centrum squash exclusion.
--   - "Enter Cote Solomo ku vet" (a butcher-counter pork cut): flat total,
--     no printed weight/rate, same butcher-counter exclusion used for
--     Receipt #2 Mangusa.
--
-- Matches to the existing catalog: Folgers Classic Roast (id 11106, exact),
-- Gold Standard Whey Vanilla (11111, "ON" = Optimum Nutrition, "VA" =
-- Vanilla), "Bakoba pa kilo" -> Bananen (bakoba) (10955, per kilo -- same
-- item, Papiamentu vs Dutch name), "Batata Dushi Korsow Kora" -> Batata
-- Dushi (lokal kòrá) (10916, "Korsow" = Curaçao, "Kora"/"kòrá" = the same
-- variety name), "Fresh Garlic 250gr" (11103, exact), "Badia Cilantro lime
-- pepper" (8768, exact). Everything else is a new product: either no
-- catalog entry exists for that brand/line at all, or the closest existing
-- entry is a different size/variant/flavor than what's printed (e.g. the
-- catalog's Toufayan wraps are all "Gluten Free", this receipt's is
-- "Plain"; the catalog's Canada Dry 12-packs are all Orangeade/Lemonade
-- flavored, this one is plain; the catalog's Breakstone entries are
-- butter, this receipt's is cottage cheese under the same brand).
--
-- Several truncated names (register receipts cut off at a fixed character
-- width) couldn't be expanded with confidence, so they're kept literal
-- rather than guessed: "Organic Valley Low Fat CO...", "Frico Gouda Kaas
-- Slices 5", "Toufayan Bagels Cinnamon R...", "I Zoom Spot Focus Solar
-- S...", "Soho Entrance Door Mat 35", "Purina Friskies Pate Clu...". Their
-- unit is recorded as "each" rather than a guessed size/count.

insert into products (slug, name, brand, category, unit, unit_size, unit_kind) values
  ('daisy-sour-cream-8oz', 'Daisy Sour Cream', null, 'Dairy', '8 oz', 8, 'oz'),
  ('awakati-avocado-p-kg', 'Awakati Avocado', null, 'Produce', 'p/kg', null, null),
  ('purina-tidy-cats-38lbs', 'Purina Tidy Cats', 'Purina', 'Household', '38 lbs', 38, 'lb'),
  ('organic-valley-low-fat', 'Organic Valley Low Fat CO...', 'Organic Valley', 'Dairy', 'each', null, null),
  ('fria-fruit-punch-2lt', 'Fria Fruit Punch', 'Fria', 'Drinks', '2 LT', 2, 'L'),
  ('fria-banana-2lt', 'Fria Banana', 'Fria', 'Drinks', '2 LT', 2, 'L'),
  ('coca-cola-zero-12x12oz', 'Coca Cola Zero, 12-Pack', null, 'Drinks', '12 x 12 oz', 144, 'oz'),
  ('bj-ultra-soft-bath-tissue', 'BJ Ultra Soft Bath Tissue', null, 'Household', 'each', null, null),
  ('stylex-document-folder', 'Stylex Document Folder', 'Stylex', 'Household', 'each', null, null),
  ('pan-portugues', 'Pan Portugues', null, 'Bakery', 'each', null, null),
  ('toufayan-wraps-plain-11oz', 'Toufayan Wraps Plain', null, 'Bakery', '11 oz', 11, 'oz'),
  ('toufayan-bagels-cinnamon-raisin', 'Toufayan Bagels Cinnamon Raisin', null, 'Bakery', 'each', null, null),
  ('presidente-beer-9-6oz-24c', 'Presidente Beer, 24-Pack', null, 'Drinks', '24 x 9.6 oz', 230.4, 'oz'),
  ('baileys-irish-cream-1lt', 'Baileys Irish Cream', 'Baileys', 'Drinks', '1 LT', 1, 'L'),
  ('frico-gouda-kaas-slices', 'Frico Gouda Kaas Slices 5', 'Frico', 'Dairy', 'each', null, null),
  ('lettuce-romaine-heart-3lb', 'Lettuce Romaine Heart', null, 'Produce', '3 lb', 3, 'lb'),
  ('frontera-moscato-750ml', 'Frontera Moscato', null, 'Drinks', '750 ml', 750, 'ml'),
  ('fiber-one-brownies-40x0-8oz', 'Fiber One Brownies, 40-Pack', null, 'Snacks', '40 x 0.8 oz', 32, 'oz'),
  ('happy-cat-minkas-perfect', 'Happy Cat Minkas Perfect', 'Happy Cat', 'Household', 'each', null, null),
  ('bazic-dry-erase-set-4pc', 'Bazic Dry Erase Set', null, 'Household', '4pc', 4, 'ct'),
  ('i-zoom-spot-focus-solar', 'I Zoom Spot Focus Solar S...', null, 'Household', 'each', null, null),
  ('soho-entrance-door-mat-35', 'Soho Entrance Door Mat 35', null, 'Household', 'each', null, null),
  ('titas-salted-green-plantain', 'Titas Salted Green Plantain', 'Titas', 'Snacks', 'each', null, null),
  ('virginia-brand-vidalia-onion-sauce', 'Virginia Brand Vidalia Onion', null, 'Pantry', 'each', null, null),
  ('alpro-coconut-almond-drink', 'Alpro Coconut Almond Drink', null, 'Dairy', 'each', null, null),
  ('breakstone-cottage-cheese', 'Breakstone Cottage Cheese', null, 'Dairy', 'each', null, null),
  ('canada-dry-ginger-ale-12pack', 'Canada Dry Ginger Ale, 12-Pack', 'Canada Dry', 'Drinks', '12 x 12 oz', 144, 'oz'),
  ('coca-cola-cur-12x12oz', 'Coca Cola Cur, 12-Pack', null, 'Drinks', '12 x 12 oz', 144, 'oz'),
  ('gillette-sensitive-shaving', 'Gillette Sensitive Shaving', 'Gillette', 'Household', 'each', null, null),
  ('coop-non-bio-laundry-powder', 'Coop Non-Bio Laundry Powder', 'Coop', 'Household', 'each', null, null),
  ('febreze-2in1-fresh-linen', 'Febreze 2in1 Fresh Linen', null, 'Household', 'each', null, null),
  ('lysol-power-foamer-bathroom', 'Lysol Power Foamer Bathroom', null, 'Household', 'each', null, null),
  ('purina-friskies-pate', 'Purina Friskies Pate Clu...', 'Purina', 'Household', 'each', null, null),
  ('jones-women-bedroom-slippers', 'Jones Women Bedroom Slippers', 'Jones', 'Household', 'each', null, null),
  ('potground-universeel-10lt', 'Potgrond Universeel', null, 'Household', '10 LT', 10, 'L');

-- Trans#116281, 4/13/2026 18:04:36
create temporary table _receipt5_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _receipt5_prices (slug, raw_name, raw_price) values
  ('daisy-sour-cream-8oz', 'Daisy Sour Cream 8oz', 4.10),
  ('awakati-avocado-p-kg', 'Awakati Avocado per kg', 9.29),
  ('purina-tidy-cats-38lbs', 'Purina Tidy Cats 38lbs', 58.72),
  ('folgers-classic-roast-43oz', 'Folgers Classic Roast 43.', 57.74),
  ('organic-valley-low-fat', 'Organic Valley Low Fat CO', 14.87),
  ('fria-fruit-punch-2lt', 'Fria Fruit Punch 2LT', 4.99),
  ('fria-banana-2lt', 'Fria Banana 2LT', 4.99),
  ('coca-cola-zero-12x12oz', 'Coca Cola Zero 12X12OZ', 18.59),
  ('bj-ultra-soft-bath-tissue', 'BJ Ultra Soft Bath Tissue', 55.79);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, user_id, receipt_id, observed_at)
select
  'goisco', t.raw_name, t.raw_price, p.id, 1, 'pending', 'receipt', null, null, '2026-04-13T18:04:36Z'
from _receipt5_prices t
join products p on p.slug = t.slug;

drop table _receipt5_prices;

-- Trans#576000, 2/27/2026 18:10:53
create temporary table _receipt6_prices (slug text, raw_name text, raw_price numeric(10,2));
insert into _receipt6_prices (slug, raw_name, raw_price) values
  ('stylex-document-folder', 'Stylex Document Folder', 17.61),
  ('on-gold-standard-whey-vanilla', 'ON Gold Standard Whey VA', 97.88),
  ('pan-portugues', 'Pan Portugues', 3.68),
  ('toufayan-wraps-plain-11oz', 'Toufayan Wraps Plain 11OZ', 5.04),
  ('toufayan-bagels-cinnamon-raisin', 'Toufayan Bagels Cinnamon R', 6.45),
  ('presidente-beer-9-6oz-24c', 'Presidente Beer 9.60Z 24C', 78.30),
  ('baileys-irish-cream-1lt', 'Baileys Irish Cream 1LT', 62.64),
  ('frico-gouda-kaas-slices', 'Frico Gouda Kaas Slices 5', 9.78),
  ('bananen-bakoba-per-kilo', 'Bakoba pa kilo', 3.02),
  ('lettuce-romaine-heart-3lb', 'Lettuce Romaine Heart 3LB', 6.84),
  ('awakati-avocado-p-kg', 'Awakati Avocado per kg', 5.87),
  ('batata-dushi-lokal-kora-p-kg', 'Batata Dushi Korsow Kora', 4.60),
  ('fresh-garlic-250gr', 'Fresh Garlic 250GR', 1.85),
  ('frontera-moscato-750ml', 'Frontera Moscato 750 ML', 13.69),
  ('fiber-one-brownies-40x0-8oz', 'Fiber One Brownies 40X0.8', 51.87),
  ('happy-cat-minkas-perfect', 'Happy Cat Minkas Perfect', 13.99),
  ('bazic-dry-erase-set-4pc', 'Bazic Dry Erase Set 4PC', 5.57),
  ('i-zoom-spot-focus-solar', 'I Zoom Spot Focus Solar S', 22.50),
  ('soho-entrance-door-mat-35', 'Soho Entrance Door Mat 35', 13.69),
  ('badia-cilantro-lime-pepper-salt-8oz', 'Badia Cilantro Lime Pepper', 7.43),
  ('titas-salted-green-plantain', 'Titas Salted Green Planta', 17.61),
  ('virginia-brand-vidalia-onion-sauce', 'Virginia Brand Vidalia On', 9.78),
  ('alpro-coconut-almond-drink', 'Alpro Coconut Almond Drink', 6.84),
  ('breakstone-cottage-cheese', 'Breakstone Cottage Cheese', 13.69),
  ('canada-dry-ginger-ale-12pack', 'Canada Dry Ginger Ale 12', 15.65),
  ('coca-cola-cur-12x12oz', 'Coca Cola Cur 12X12OZ', 18.59),
  ('coca-cola-zero-12x12oz', 'Coca Cola Zero 12X12OZ', 18.59),
  ('gillette-sensitive-shaving', 'Gillette Sensitive Shaving', 7.82),
  ('coop-non-bio-laundry-powder', 'Coop Non-Bio Laundry Powd', 3.49),
  ('febreze-2in1-fresh-linen', 'Febreze 2in1 Fresh Linen', 8.31),
  ('lysol-power-foamer-bathroom', 'Lysol Power Foamer Bathroo', 8.31),
  ('purina-friskies-pate', 'Purina Friskies Pate Clu', 137.04),
  ('jones-women-bedroom-slippers', 'Jones Women Bedroom Slipp', 23.48),
  ('potground-universeel-10lt', 'Potgrond Universeel 10 LT', 4.88);

insert into scraped_prices
  (store_id, raw_name, raw_price, matched_product_id, match_confidence, status, source, user_id, receipt_id, observed_at)
select
  'goisco', t.raw_name, t.raw_price, p.id, 1, 'pending', 'receipt', null, null, '2026-02-27T18:10:53Z'
from _receipt6_prices t
join products p on p.slug = t.slug;

drop table _receipt6_prices;
