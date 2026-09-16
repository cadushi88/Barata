-- migrations/0025_fix_quaker_capitalization.sql
-- Data-quality nit found while auditing for duplicate products: id 180 was
-- entered as "Quaker Quick cooking" (lowercase "cooking") while its 330g
-- sibling (id 179) is "Quaker Quick Cooking" — same product line, different
-- pack size, just an inconsistent capitalization. Not a duplicate to merge:
-- every other exact-name group in the catalog turned out to differ in a real
-- attribute (unit/unit_size), representing genuinely different SKUs sold at
-- different prices (e.g. produce priced per kilo vs. per piece).
update products set name = 'Quaker Quick Cooking' where id = 180 and name = 'Quaker Quick cooking';
