-- DeliNova: a Willemstad hospitality/specialty wholesaler (meat, fish, cheese,
-- produce, dry goods, drinks) whose webshop (orders.deli-nova.com) now also
-- serves individual customers with home delivery — found during Day 10
-- catalog research (2026-09-24) as a genuinely new, per-item priced Curaçao
-- webshop. Single delivery-based operation, not a chain of physical stores,
-- so one row like the other single-location entries in this table.
insert into stores (id, name, area, address, hours, price_tier, lat, lng) values
  ('delinova', 'DeliNova', 'Willemstad', 'Kaminda Andre J.E. Kusters 3, Willemstad', 'Mon-Fri 8am-6pm, Sat 8am-5pm, Sun 8am-1pm', 'premium', 12.108, -68.933)
on conflict (id) do nothing;
