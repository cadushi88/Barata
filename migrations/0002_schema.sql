-- migrations/0002_schema.sql
create table if not exists stores (
  id text primary key,
  name text not null,
  area text not null,
  address text,
  hours text,
  price_tier text not null,
  lat numeric,
  lng numeric
);
create table if not exists products (
  id serial primary key,
  slug text unique not null,
  name text not null,
  brand text,
  category text not null,
  unit text not null,
  unit_size numeric,
  unit_kind text
);
create table if not exists prices (
  id serial primary key,
  product_id int not null references products(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  amount numeric(10,2) not null,
  observed_at timestamptz not null default now(),
  source text not null default 'seed',
  user_id text
);
create index if not exists prices_product_store_obs_idx on prices (product_id, store_id, observed_at desc);
create index if not exists products_category_idx on products (category);
create index if not exists products_name_idx on products (name);
create table if not exists shopping_list (
  id serial primary key,
  user_id text not null,
  product_id int not null references products(id) on delete cascade,
  qty numeric(10,2) not null default 1,
  unique (user_id, product_id)
);
create index if not exists shopping_list_user_idx on shopping_list (user_id);
create table if not exists receipts (
  id serial primary key,
  user_id text not null,
  store_id text references stores(id),
  raw_text text,
  parsed jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists receipts_user_idx on receipts (user_id);
