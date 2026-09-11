-- migrations/0024_admin_dashboard.sql
-- Foundation for the admin dashboard: one unified pending-price-change queue
-- (generalizing the scraper's staging table to also hold receipt and manual
-- price submissions, so nothing publishes to the live catalog without admin
-- review), a simple user<->admin messages inbox, and a table for real,
-- admin-uploaded product photos (stored in the DB, since Vercel's build
-- output isn't writable at runtime -- there's nowhere on disk to put them).

alter table scraped_prices alter column run_id drop not null;
alter table scraped_prices add column if not exists source text not null default 'scrape';
alter table scraped_prices add column if not exists user_id text;
alter table scraped_prices add column if not exists receipt_id int references receipts(id) on delete set null;
-- The real observed date for receipt submissions (the purchase date on the
-- receipt, not whenever admin gets around to approving it) — null defaults
-- to "now" at approval time, which is correct for scrape/manual sources.
alter table scraped_prices add column if not exists observed_at timestamptz;
create index if not exists scraped_prices_source_idx on scraped_prices (source);

create table if not exists messages (
  id serial primary key,
  user_id text not null,
  body text not null,
  status text not null default 'open',
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_user_idx on messages (user_id, created_at desc);
create index if not exists messages_status_idx on messages (status);

create table if not exists product_photos (
  product_id int primary key references products(id) on delete cascade,
  data bytea not null,
  content_type text not null,
  uploaded_by text not null,
  uploaded_at timestamptz not null default now()
);
