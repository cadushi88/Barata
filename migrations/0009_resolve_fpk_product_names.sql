-- migrations/0009_resolve_fpk_product_names.sql
-- Resolves 41 of the 43 products flagged in 0008 as bare brand names with no
-- product type. Each name below was confirmed either directly (the brand's
-- known product line, several verified as sold in Curaçao specifically — e.g.
-- Hardon black tea and Crown tea both listed at Mangusa Hypermarket, Disiclin
-- and Softex/Swave/Noky are Curaçao-based brands) or by strong positional
-- evidence: the row sits inside an unambiguous same-product cluster in the
-- source list (e.g. "Famosa 425 gr" between six explicit "X bonchi korá"
-- rows of the same 400-425 gr size).
--
-- Two products could not be resolved with reasonable confidence even after
-- research (sapac-340-gr, phoebe-1-lb) and stay flagged for needs_review.

update products set name = 'Hazella Hazelnut Chocolate Spread', needs_review = false where slug = 'hazella-350-gr';
update products set name = 'Famosa Bonchi Korá', needs_review = false where slug = 'famosa-425-gr';
update products set name = 'Harbeez Bonchi Korá', needs_review = false where slug = 'harbeez-400-gr';
update products set name = 'Metelliana Bonchi Korá', needs_review = false where slug = 'metelliana-400-gr';
update products set name = 'Libby''s Whole Kernel Corn', needs_review = false where slug = 'libby-s-432-gr';
update products set name = 'Harbeez Bonchi Korá', needs_review = false where slug = 'harbeez-400-gr-2';
update products set name = 'Goya Whole Kernel Corn', needs_review = false where slug = 'goya-432-gr';
update products set name = 'Kwidzyn Doperwten', needs_review = false where slug = 'kwidzyn-400-gr';
update products set name = 'Famosa Bonchi Korá', needs_review = false where slug = 'famosa-425-gr-2';
update products set name = 'Flag Wheat Flour', needs_review = false where slug = 'flag-4-4-lbs';
update products set name = 'Tropic Tomato Paste', needs_review = false where slug = 'tropic-500-gr';
update products set name = 'Alfresco Tomato Paste', needs_review = false where slug = 'alfresco-500-gr';
update products set name = 'Kingtom Tomato Paste', needs_review = false where slug = 'kingtom-370-gr';
update products set name = 'Royal Sugar', needs_review = false where slug = 'royal-2-lbs';
update products set name = 'Eagle Sugar', needs_review = false where slug = 'eagle-2-lbs';
update products set name = 'Eagle Sugar', needs_review = false where slug = 'eagle-4-lbs';
update products set name = 'Manuelita Sugar', needs_review = false where slug = 'manuelita-1-kg';
update products set name = 'Manuelita Sugar', needs_review = false where slug = 'manuelita-2-kg';
update products set name = 'Hardon Black Tea', needs_review = false where slug = 'hardon-25-stuks';
update products set name = 'Crown Tea', needs_review = false where slug = 'crown-20-stuks';
update products set name = 'Kellogg''s Cereal', needs_review = false where slug = 'kellog-s-9-6-oz';
update products set name = 'Kellogg''s Cereal', needs_review = false where slug = 'kellog-s-12-oz';
update products set name = 'Kellogg''s Cereal', needs_review = false where slug = 'kellog-s-18-oz';
update products set name = 'Coast Evaporated Milk', needs_review = false where slug = 'coast-410-gr';
update products set name = 'Bonle Evaporated Milk', needs_review = false where slug = 'bonle-410-gr';
update products set name = 'Incolac Full Cream Milk Powder', needs_review = false where slug = 'incolac-400-gr';
update products set name = 'Coast Evaporated Milk', needs_review = false where slug = 'coast-360-gr';
update products set name = 'Palmolive Bath Soap', needs_review = false where slug = 'palmolive-110-gr';
update products set name = 'Lux Bath Soap', needs_review = false where slug = 'lux-80-gr';
update products set name = 'Disiclin Disinfectant Cleaner', needs_review = false where slug = 'disiclin-3-79-ltr';
update products set name = 'Cif Surface Cleaner', needs_review = false where slug = 'cif-500-ml';
update products set name = 'Glorall Bleach', needs_review = false where slug = 'glorall-64-oz';
update products set name = 'Tempo Bleach', needs_review = false where slug = 'tempo-56-oz';
update products set name = 'Tempo Bleach', needs_review = false where slug = 'tempo-3-79-ltr';
update products set name = 'Tempo Bleach', needs_review = false where slug = 'tempo-64-oz';
update products set name = 'Jab Household Cleaner', needs_review = false where slug = 'jab-28-oz';
update products set name = 'Vex Household Cleaner', needs_review = false where slug = 'vex-500-ml';
update products set name = 'Clorox Bleach', needs_review = false where slug = 'clorox-64-oz';
update products set name = 'Softex Toilet Paper', needs_review = false where slug = 'softex-12-stuks';
update products set name = 'Swave Napkins', needs_review = false where slug = 'swave-12-stuks';
update products set name = 'Noky Bathroom Tissue', needs_review = false where slug = 'noky-12-stuks';
