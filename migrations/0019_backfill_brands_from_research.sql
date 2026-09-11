-- migrations/0019_backfill_brands_from_research.sql
-- Backfills the "brand" column using the daily catalog-research project's
-- brand-identification findings (see the "Catalog Research Log" notes).
-- Every one of these items already carries its brand as plain text inside
-- the product name (e.g. "Coroos bonchi korá", "Alfresco Tomato Paste") --
-- this just lifts that brand into its own column so the catalog UI (which
-- already renders "Category · Brand · Unit" when brand is set) can show
-- it, and so a future "filter/compare by brand" feature has real data.
-- Guarded against both representations of "no brand yet" seen in the schema
-- (NULL from newer inserts, '' from the original seed/survey migrations) so
-- this never overwrites an existing value; matched by product id (from the
-- current live catalog), not slug, since several of these predate
-- consistent slug naming.

update products set brand = 'Nutella' where id = 85 and (brand is null or brand = ''); -- Nutella Chocco
update products set brand = 'Hazella' where id = 86 and (brand is null or brand = ''); -- Hazella Hazelnut Chocolate Spread
update products set brand = 'Bush''s' where id = 87 and (brand is null or brand = ''); -- Bush''s bonchi korá
update products set brand = 'Sapac' where id = 88 and (brand is null or brand = ''); -- Sapac bonchi korá
update products set brand = 'Goya' where id = 90 and (brand is null or brand = ''); -- Goya bonchi korá
update products set brand = 'Grace' where id = 91 and (brand is null or brand = ''); -- Grace bonchi korá
update products set brand = 'Coroos' where id = 92 and (brand is null or brand = ''); -- Coroos bonchi korá
update products set brand = 'Famosa' where id = 93 and (brand is null or brand = ''); -- Famosa Bonchi Korá
update products set brand = 'Harbeez' where id = 94 and (brand is null or brand = ''); -- Harbeez Bonchi Korá
update products set brand = 'Metelliana' where id = 95 and (brand is null or brand = ''); -- Metelliana Bonchi Korá
update products set brand = 'Goya' where id = 100 and (brand is null or brand = ''); -- Goya blackeye peas
update products set brand = 'Goya' where id = 101 and (brand is null or brand = ''); -- Goya green split peas
update products set brand = 'Goya' where id = 102 and (brand is null or brand = ''); -- Goya red kidney
update products set brand = 'Alberto' where id = 103 and (brand is null or brand = ''); -- Alberto red kidney
update products set brand = 'Libby''s' where id = 104 and (brand is null or brand = ''); -- Libby''s Whole Kernel Corn
update products set brand = 'Harbeez' where id = 105 and (brand is null or brand = ''); -- Harbeez Whole Kernel Corn
update products set brand = 'Goya' where id = 106 and (brand is null or brand = ''); -- Goya Whole Kernel Corn
update products set brand = 'Sapac' where id = 107 and (brand is null or brand = ''); -- Sapac Whole Kernel Corn
update products set brand = 'Kwidzyn' where id = 108 and (brand is null or brand = ''); -- Kwidzyn Whole Kernel Corn
update products set brand = 'Sun Lee' where id = 109 and (brand is null or brand = ''); -- Sun Lee
update products set brand = 'Famosa' where id = 110 and (brand is null or brand = ''); -- Famosa Whole Kernel Corn
update products set brand = 'Libby''s' where id = 111 and (brand is null or brand = ''); -- Libby''s Peas & Carrots
update products set brand = 'Libby''s' where id = 112 and (brand is null or brand = ''); -- Libby''s Rooibiet diced
update products set brand = 'Libby''s' where id = 113 and (brand is null or brand = ''); -- Libby''s Rooibiet sliced
update products set brand = 'Goya' where id = 114 and (brand is null or brand = ''); -- Goya Doperwten
update products set brand = 'Goya' where id = 115 and (brand is null or brand = ''); -- Goya Peas & Carrots
update products set brand = 'Goya' where id = 116 and (brand is null or brand = ''); -- Goya Rooibiet Slices
update products set brand = 'Goya' where id = 117 and (brand is null or brand = ''); -- Goya Wortel Slices
update products set brand = 'Goya' where id = 118 and (brand is null or brand = ''); -- Goya Mix Groenten
update products set brand = 'Sapac' where id = 119 and (brand is null or brand = ''); -- Sapac doperwten
update products set brand = 'Kwidzyn' where id = 120 and (brand is null or brand = ''); -- Kwidzyn doperwten
update products set brand = 'Gwoon' where id = 121 and (brand is null or brand = ''); -- Gwoon doperwten
update products set brand = 'Campbell''s' where id = 122 and (brand is null or brand = ''); -- Campbell''s vegetable
update products set brand = 'Campbell''s' where id = 123 and (brand is null or brand = ''); -- Campbell''s chicken noodle
update products set brand = 'Unox' where id = 124 and (brand is null or brand = ''); -- Unox stevige groente soep
update products set brand = 'Unox' where id = 125 and (brand is null or brand = ''); -- Unox stevigekippen soep
update products set brand = 'Continental' where id = 126 and (brand is null or brand = ''); -- Continental Sopa de Fideos/ in pak
update products set brand = 'Jumbo' where id = 127 and (brand is null or brand = ''); -- Jumbo tomaten soep
update products set brand = 'Jumbo' where id = 128 and (brand is null or brand = ''); -- Jumbo erwten soep
update products set brand = 'Honig' where id = 129 and (brand is null or brand = ''); -- Macaroni Elbow Honig
update products set brand = 'Gallo' where id = 130 and (brand is null or brand = ''); -- Gallo Macaroni Elbow
update products set brand = 'Camil' where id = 131 and (brand is null or brand = ''); -- Camil (bruin)
update products set brand = 'Blue Ribbon' where id = 132 and (brand is null or brand = ''); -- Blue Ribbon (bruin)
update products set brand = 'Blue Ribbon' where id = 133 and (brand is null or brand = ''); -- Blue Ribbon (wit)
update products set brand = 'Nika' where id = 134 and (brand is null or brand = ''); -- Nika (bruin)
update products set brand = 'Nika' where id = 135 and (brand is null or brand = ''); -- Nika (wit)
update products set brand = 'Promasa' where id = 136 and (brand is null or brand = ''); -- Promasa/geel
update products set brand = 'Harina P.A.N.' where id = 137 and (brand is null or brand = ''); -- P.A.N./geel
update products set brand = 'Harina P.A.N.' where id = 139 and (brand is null or brand = ''); -- P.A.N./ wit
update products set brand = 'Phoebe' where id = 140 and (brand is null or brand = ''); -- Phoebe Corn Flour
update products set brand = 'Robin Hood' where id = 141 and (brand is null or brand = ''); -- Robin Hood
update products set brand = 'Gold Medal' where id = 144 and (brand is null or brand = ''); -- Gold Medal (all purpose)
update products set brand = 'Gold Medal' where id = 145 and (brand is null or brand = ''); -- Gold Medal (all purpose)
update products set brand = 'Sun Flower' where id = 146 and (brand is null or brand = ''); -- Sun Flower
update products set brand = 'Vigo' where id = 147 and (brand is null or brand = ''); -- Vigo Olive Oil 100% pure
update products set brand = 'Wesson' where id = 148 and (brand is null or brand = ''); -- Wesseon Canola Oil
update products set brand = 'Vigo' where id = 149 and (brand is null or brand = ''); -- Vigo (extra virgin )
update products set brand = 'Badia' where id = 150 and (brand is null or brand = ''); -- Badia (extra virgin )
update products set brand = 'Badia' where id = 151 and (brand is null or brand = ''); -- Badia (extra virgin )
update products set brand = 'Goya' where id = 152 and (brand is null or brand = ''); -- Goya puro
update products set brand = 'Renia' where id = 153 and (brand is null or brand = ''); -- Renia gold
update products set brand = 'Becel' where id = 154 and (brand is null or brand = ''); -- Becel original
update products set brand = 'Sane' where id = 155 and (brand is null or brand = ''); -- Sane light
update products set brand = 'Remia' where id = 156 and (brand is null or brand = ''); -- Remia light
update products set brand = 'Gwoon' where id = 157 and (brand is null or brand = ''); -- Gwoon light
update products set brand = 'Hunt''s' where id = 158 and (brand is null or brand = ''); -- Hunt''s Paste
update products set brand = 'Alfresco' where id = 161 and (brand is null or brand = ''); -- Alfresco Tomato Paste
update products set brand = 'Kingtom' where id = 162 and (brand is null or brand = ''); -- Kingtom Tomato Paste
update products set brand = 'Orient Star' where id = 163 and (brand is null or brand = ''); -- Orient Star
update products set brand = 'Royal Sugar' where id = 164 and (brand is null or brand = ''); -- Royal Sugar
update products set brand = 'King Sugar' where id = 165 and (brand is null or brand = ''); -- King Sugar
update products set brand = 'Eagle' where id = 166 and (brand is null or brand = ''); -- Eagle Sugar
update products set brand = 'Eagle' where id = 167 and (brand is null or brand = ''); -- Eagle Sugar
update products set brand = 'Manuelita' where id = 168 and (brand is null or brand = ''); -- Manuelita Sugar
update products set brand = 'Manuelita' where id = 169 and (brand is null or brand = ''); -- Manuelita Sugar
update products set brand = 'Lipton' where id = 170 and (brand is null or brand = ''); -- Lipton Yellow Label
update products set brand = 'Hardon' where id = 171 and (brand is null or brand = ''); -- Hardon Black Tea
update products set brand = 'Crown Tea' where id = 172 and (brand is null or brand = ''); -- Crown Tea
update products set brand = 'Colcafé' where id = 173 and (brand is null or brand = ''); -- Colcafe Clasico
update products set brand = 'Nescafé' where id = 174 and (brand is null or brand = ''); -- Nescafe Instant
update products set brand = 'Kellogg''s' where id = 176 and (brand is null or brand = ''); -- Kellogg''s Corn Flakes
update products set brand = 'Kellogg''s' where id = 177 and (brand is null or brand = ''); -- Kellogg''s Corn Flakes
update products set brand = 'Kellogg''s' where id = 178 and (brand is null or brand = ''); -- Kellogg''s Corn Flakes
update products set brand = 'Quaker' where id = 179 and (brand is null or brand = ''); -- Quaker Quick Cooking
update products set brand = 'Quaker' where id = 180 and (brand is null or brand = ''); -- Quaker Quick cooking
update products set brand = 'Quaker' where id = 181 and (brand is null or brand = ''); -- Quaker Instant
update products set brand = 'Quaker' where id = 182 and (brand is null or brand = ''); -- Quaker Instant
update products set brand = 'Gloria' where id = 183 and (brand is null or brand = ''); -- Gloria Orange
update products set brand = 'Ceres' where id = 184 and (brand is null or brand = ''); -- Ceres Apple
update products set brand = 'Baggio' where id = 185 and (brand is null or brand = ''); -- Baggio Pronto Peer
update products set brand = 'Friesche Vlag' where id = 186 and (brand is null or brand = ''); -- Friesche Vlag halfvolle
update products set brand = 'Friesche Vlag' where id = 187 and (brand is null or brand = ''); -- Friesche Vlag magere
update products set brand = 'Sane' where id = 188 and (brand is null or brand = ''); -- Sane halfvolle
update products set brand = 'Gloria' where id = 189 and (brand is null or brand = ''); -- Gloria Vollemelk
update products set brand = 'Coast' where id = 190 and (brand is null or brand = ''); -- Coast Evaporated Milk
update products set brand = 'Bonlé' where id = 191 and (brand is null or brand = ''); -- Bonle Evaporated Milk
update products set brand = 'Frisian Flag' where id = 192 and (brand is null or brand = ''); -- Frisian Flag
update products set brand = 'Incolac' where id = 193 and (brand is null or brand = ''); -- Incolac Full Cream Milk Powder
update products set brand = 'Frisian Flag' where id = 194 and (brand is null or brand = ''); -- Frisian Flag
update products set brand = 'Hollandia' where id = 195 and (brand is null or brand = ''); -- Hollandia Street
update products set brand = 'Coast' where id = 196 and (brand is null or brand = ''); -- Coast Full Cream Milk Powder
update products set brand = 'Sunquick' where id = 197 and (brand is null or brand = ''); -- Sun Quick Tropical
update products set brand = 'Sunquick' where id = 198 and (brand is null or brand = ''); -- Sun Quick Orange
update products set brand = 'Colgate' where id = 201 and (brand is null or brand = ''); -- Colgate Cavity Protection
update products set brand = 'Safeguard' where id = 202 and (brand is null or brand = ''); -- Safeguard Antibacterial
update products set brand = 'Palmolive' where id = 203 and (brand is null or brand = ''); -- Palmolive Bath Soap
update products set brand = 'Lux' where id = 204 and (brand is null or brand = ''); -- Lux Bath Soap
update products set brand = 'Stayfree' where id = 205 and (brand is null or brand = ''); -- Stayfree Regular Maxi
update products set brand = 'Libresse' where id = 206 and (brand is null or brand = ''); -- Libresse Regular Ultra Thin
update products set brand = 'Always' where id = 207 and (brand is null or brand = ''); -- Always Regular Ultra Thin with Flexi Wings
update products set brand = 'Palmolive' where id = 208 and (brand is null or brand = ''); -- Palmolive Original
update products set brand = 'Tempo' where id = 209 and (brand is null or brand = ''); -- Tempo Dish Soap
update products set brand = 'Jab' where id = 210 and (brand is null or brand = ''); -- Jab Dish Soap
update products set brand = 'Disiclin' where id = 211 and (brand is null or brand = ''); -- Disiclin Disinfectant Cleaner
update products set brand = 'Tempo' where id = 212 and (brand is null or brand = ''); -- Tempo Disinfectant
update products set brand = 'Vex' where id = 213 and (brand is null or brand = ''); -- Vex Scouring Cleaner
update products set brand = 'Cif' where id = 214 and (brand is null or brand = ''); -- Cif Scouring Cleaner
update products set brand = 'All Clean' where id = 215 and (brand is null or brand = ''); -- All Clean
update products set brand = 'La Oca' where id = 216 and (brand is null or brand = ''); -- La oca/ baño
update products set brand = 'Glorall' where id = 217 and (brand is null or brand = ''); -- Glorall Bleach
update products set brand = 'Tempo' where id = 218 and (brand is null or brand = ''); -- Tempo Bleach
update products set brand = 'Clorox' where id = 219 and (brand is null or brand = ''); -- Clorox Bleach
update products set brand = 'Softex' where id = 220 and (brand is null or brand = ''); -- Softex Toilet Paper
update products set brand = 'Swave' where id = 221 and (brand is null or brand = ''); -- Swave Napkins
update products set brand = 'Noky' where id = 222 and (brand is null or brand = ''); -- Noky Bathroom Tissue
update products set brand = 'Goya' where id = 320 and (brand is null or brand = ''); -- Goya pinto
update products set brand = 'Tiburon' where id = 321 and (brand is null or brand = ''); -- Tiburon no 1
update products set brand = 'Renia' where id = 322 and (brand is null or brand = ''); -- Renia Original
update products set brand = 'Remia' where id = 323 and (brand is null or brand = ''); -- Remia nieuw light
update products set brand = 'Kotex' where id = 324 and (brand is null or brand = ''); -- Kotex Maxi Regular
update products set brand = 'Country Fresh' where id = 400 and (brand is null or brand = ''); -- Country Fresh Whole Mushrooms
update products set brand = 'Sunbelle' where id = 415 and (brand is null or brand = ''); -- Sunbelle Blueberries
update products set brand = 'Fuik' where id = 418 and (brand is null or brand = ''); -- Fuik Mint Herbs
update products set brand = 'Fuik' where id = 425 and (brand is null or brand = ''); -- Fuik Romero Herbs
update products set brand = 'Fuik' where id = 426 and (brand is null or brand = ''); -- Fuik Lemongrass Herbs
update products set brand = 'Fuik' where id = 427 and (brand is null or brand = ''); -- Fuik Cilantro Herbs
