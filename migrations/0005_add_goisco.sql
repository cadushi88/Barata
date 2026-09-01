-- migrations/0005_add_goisco.sql
insert into stores (id, name, area, address, hours, price_tier, lat, lng) values
  ('goisco', 'Goisco', 'Schottegatweg Noord', 'Schottegatweg Noord 24, Willemstad', null, 'mid', 12.1224, -68.9282)
on conflict (id) do nothing;
