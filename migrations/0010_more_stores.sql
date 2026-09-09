-- migrations/0010_more_stores.sql
-- Additional real Curaçao supermarkets found via research, not previously in the catalog.
-- Coordinates are approximate (Zeelandia/Willemstad area centers) and hours are placeholders
-- where not confirmed — worth verifying precisely before showing distances/hours to users.
insert into stores (id, name, area, address, hours, price_tier, lat, lng) values
  ('albert-heijn-zeelandia', 'Albert Heijn', 'Zeelandia', 'Zeelandia, Willemstad', null, 'premium', 12.1175, -68.9345),
  ('alves', 'Alves Supermarket', 'Willemstad', null, null, 'mid', 12.108, -68.933),
  ('centrum-wholesale', 'Centrum Wholesale', 'Willemstad', null, null, 'budget', 12.108, -68.933)
on conflict (id) do nothing;
