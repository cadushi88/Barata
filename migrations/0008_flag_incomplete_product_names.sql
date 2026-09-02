-- migrations/0008_flag_incomplete_product_names.sql
-- The FPK survey import (0007) captured only the brand column for many rows;
-- the generic product type (e.g. "beans", "flour") that the source PDF stated
-- once per category group was lost. These 43 products have a name that is
-- just a bare brand with no product type, so they should not be trusted for
-- receipt auto-matching or display until reviewed against the original source.
alter table products add column if not exists needs_review boolean not null default false;

update products set needs_review = true where slug in (
  'hazella-350-gr', 'famosa-425-gr', 'harbeez-400-gr', 'metelliana-400-gr',
  'libby-s-432-gr', 'harbeez-400-gr-2', 'goya-432-gr', 'sapac-340-gr',
  'kwidzyn-400-gr', 'famosa-425-gr-2', 'phoebe-1-lb', 'flag-4-4-lbs',
  'tropic-500-gr', 'alfresco-500-gr', 'kingtom-370-gr', 'royal-2-lbs',
  'eagle-2-lbs', 'eagle-4-lbs', 'manuelita-1-kg', 'manuelita-2-kg',
  'hardon-25-stuks', 'crown-20-stuks', 'kellog-s-9-6-oz', 'kellog-s-12-oz',
  'kellog-s-18-oz', 'coast-410-gr', 'bonle-410-gr', 'incolac-400-gr',
  'coast-360-gr', 'palmolive-110-gr', 'lux-80-gr', 'tempo-56-oz', 'jab-28-oz',
  'disiclin-3-79-ltr', 'tempo-3-79-ltr', 'vex-500-ml', 'cif-500-ml',
  'glorall-64-oz', 'tempo-64-oz', 'clorox-64-oz', 'softex-12-stuks',
  'swave-12-stuks', 'noky-12-stuks'
);
