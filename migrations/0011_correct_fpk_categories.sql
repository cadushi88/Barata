-- migrations/0011_correct_fpk_categories.sql
-- Corrections found by cross-referencing FPK's August 2026 supermarket/minimarket
-- survey (which includes a Categorie column absent from the original 0007 import).
-- Several brand-only names guessed in 0009 turn out to be wrong: a brand can appear
-- under two different categories at the same weight (e.g. Harbeez sells both a bean
-- and a corn product at 400g), and "Tempo" turns out to be three different products
-- (dish soap, disinfectant, bleach) at three different sizes, not bleach three times.

update products set name = 'Harbeez Whole Kernel Corn', needs_review = false where slug = 'harbeez-400-gr-2';
update products set name = 'Kwidzyn Whole Kernel Corn', needs_review = false where slug = 'kwidzyn-400-gr';
update products set name = 'Famosa Whole Kernel Corn', needs_review = false where slug = 'famosa-425-gr-2';
update products set name = 'Sapac Whole Kernel Corn', needs_review = false where slug = 'sapac-340-gr';
update products set name = 'Phoebe Corn Flour', needs_review = false where slug = 'phoebe-1-lb';
update products set name = 'Kellogg''s Corn Flakes' where slug = 'kellog-s-9-6-oz';
update products set name = 'Kellogg''s Corn Flakes' where slug = 'kellog-s-12-oz';
update products set name = 'Kellogg''s Corn Flakes' where slug = 'kellog-s-18-oz';
update products set name = 'Coast Full Cream Milk Powder' where slug = 'coast-360-gr';
update products set name = 'Tempo Dish Soap' where slug = 'tempo-56-oz';
update products set name = 'Jab Dish Soap' where slug = 'jab-28-oz';
update products set name = 'Tempo Disinfectant' where slug = 'tempo-3-79-ltr';
update products set name = 'Vex Scouring Cleaner' where slug = 'vex-500-ml';
update products set name = 'Cif Scouring Cleaner' where slug = 'cif-500-ml';
