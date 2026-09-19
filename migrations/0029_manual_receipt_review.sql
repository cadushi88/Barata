-- migrations/0029_manual_receipt_review.sql
-- Receipt reading no longer requires a paid Claude API call: a user can submit a
-- receipt (text and/or photo) straight into a review queue, with no parsing done
-- at submit time. An admin (working with Claude Code directly, off-platform)
-- transcribes the photo later and lands the results as a normal migration into
-- `scraped_prices`, same as every other price source. This just gives that queue
-- somewhere to keep the photo until it's been transcribed.
alter table receipts add column if not exists photo_data bytea;
alter table receipts add column if not exists photo_content_type text;
