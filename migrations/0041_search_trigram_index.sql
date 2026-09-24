-- searchProducts/searchProductsForLinking filter on
-- `lower(name) like '%...%'` and `lower(coalesce(brand,'')) like '%...%'` — a
-- leading wildcard that no plain btree index (products_name_idx included) can
-- ever use, so every search was a full sequential scan over the whole
-- products table. Trigram GIN indexes on the same expressions let Postgres
-- accelerate a substring LIKE.
create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx on products using gin (lower(name) gin_trgm_ops);
create index if not exists products_brand_trgm_idx on products using gin (lower(coalesce(brand, '')) gin_trgm_ops);
