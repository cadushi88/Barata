-- migrations/0004_receipt_detection.sql
alter table receipts add column if not exists purchase_date date;
alter table receipts add column if not exists detected_store_id text references stores(id);
alter table receipts add column if not exists store_match_confidence numeric(3,2);
