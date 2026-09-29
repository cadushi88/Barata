-- Curaçao Foods Trade (curfoods.com): a Willemstad food/non-food distributor
-- (established 1967) whose storefront serves wholesale accounts and
-- individual retail customers alike with real NAf per-item prices — found
-- during Day 15 catalog research (2026-09-29) as a genuinely new, per-item
-- priced Curaçao webshop. Single distribution/retail location, not a chain
-- of physical stores, so one row like the other single-location entries in
-- this table (DeliNova, migration 0042).
insert into stores (id, name, area, address, hours, price_tier, lat, lng) values
  ('curfoods', 'Curaçao Foods Trade', 'Willemstad', 'Majoorsweg 2-12, Willemstad', null, 'mid', 12.113, -68.949)
on conflict (id) do nothing;
