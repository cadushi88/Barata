-- migrations/0020_scraper_staging.sql
-- Staging tables for the automated store-webshop scraper. Scraped prices
-- never touch the live `prices` table directly -- every run lands here
-- first, and a human (or a future auto-approval rule) reviews and approves
-- each item before it becomes a real price shown to shoppers. This keeps a
-- scraper bug (a parsing mistake, a site redesign that silently returns
-- garbage) from ever polluting the public catalog unreviewed.

create table if not exists scrape_runs (
  id serial primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running', -- running | completed | failed
  triggered_by text not null default 'cron' -- cron | manual
);

create table if not exists scrape_store_results (
  id serial primary key,
  run_id int not null references scrape_runs(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  status text not null default 'running', -- running | success | error
  items_found int not null default 0,
  error text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);
create index if not exists scrape_store_results_run_idx on scrape_store_results (run_id);

create table if not exists scraped_prices (
  id serial primary key,
  run_id int not null references scrape_runs(id) on delete cascade,
  store_id text not null references stores(id) on delete cascade,
  raw_name text not null,
  raw_unit text,
  raw_price numeric(10,2) not null,
  raw_url text,
  -- Best-effort match against the existing catalog, computed at scrape time.
  -- Null means "no confident match" -- the reviewer either maps it to an
  -- existing product by hand or (later) creates a new one; this migration
  -- does not add scraper-driven product creation, only staged prices.
  matched_product_id int references products(id) on delete set null,
  match_confidence numeric(3,2),
  status text not null default 'pending', -- pending | approved | rejected
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz not null default now()
);
create index if not exists scraped_prices_run_idx on scraped_prices (run_id);
create index if not exists scraped_prices_status_idx on scraped_prices (status);
create index if not exists scraped_prices_store_idx on scraped_prices (store_id);
