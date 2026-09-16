-- migrations/0026_import_curacao_webshop_scrape.sql
-- One-off import of the daily research routine's Goisco/Mangusa/Van den Tweel
-- webshop scrape (Google Drive: "Barata - Curaçao supermarket prices"),
-- matched against the existing catalog with the same bestMatch() algorithm
-- the live scraper uses (min confidence 0.72). Prices are staged
-- in scraped_prices for admin review exactly like any other scrape run --
-- never written to the live prices table here. Product photo links are
-- applied directly (products.image_url is a cosmetic hint, not a price, so
-- it carries none of the trust risk the review gate exists for).
insert into scrape_runs (triggered_by, status, finished_at) values ('manual', 'completed', now());

-- Staged price matches: 113 rows
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Colgate Cavity Protection, 8 OZ', 5.78, 'https://goisco.com/products/colgate-cavity-protection-8-oz', 201, 0.84, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Green Onions , 10 oz', 3.78, 'https://goisco.com/products/green-onions-10-oz', 435, 0.78, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Romaine Lettuce Hearts, 3 ct', 7.99, 'https://goisco.com/products/queen-victoria-romaine-lettuce-hearts-3-ct-copy', 432, 0.84, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Lipton Yellow Label Tea, 100 ct', 9.99, 'https://goisco.com/products/copy-of-lipton-yellow-label-tea-satchets-100-ct', 170, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Colgate Cavity Protection Toothpaste, 8 oz', 5.78, 'https://goisco.com/products/colgate-cavity-protection-toothpaste-8-oz', 201, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Folgers Classic Roast Ground Coffee , 43.5 oz', 69.46, 'https://goisco.com/products/folgers-classic-roast-ground-coffee-43-5-oz', 450, 0.72, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Abrilsol Sunflower Oil , 1 L', 6.94, 'https://goisco.com/products/abrilsol-sunflower-oil-1-l', 16, 0.78, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Lipton Yellow Label Tea Satchets , 100 ct', 9.99, 'https://goisco.com/products/lipton-yellow-label-tea-satchets-100-ct', 170, 0.72, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', '409 Sponge Brush , 1 ct', 5.25, 'https://goisco.com/products/409-sponge-brush-1-ct', 448, 0.82, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Campbell''s Vegetable Soup Can , 10.5 oz', 4.2, 'https://goisco.com/products/campbells-vegetable-soup-can-10-5-oz', 122, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Biju White Rice, 1 kg', 2.35, 'https://goisco.com/products/biju-white-rice-1-kg', 11, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Siboyo Largu/Green Onion, 1 ct', 1.6, 'https://goisco.com/products/siboyo-largu-green-onion-1-ct', 409, 0.84, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'goisco', 'Persil Color Liquid Laundry Detergent , 3 L', 19.99, 'https://goisco.com/products/persil-color-liquid-laundry-detergent-3-l', 60, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Hardon Black tea 25pc (12 pieces)', 34.8, 'https://www.mangusahypermarket.com/product/hardon-black-tea-25pc-12-pieces/', 171, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Hardon Black tea 25pc (12 pieces)', 34.8, 'https://www.mangusahypermarket.com/product/hardon-black-tea-25pc-12-pieces/', 171, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Tropic Tomato paste 500gr (12 pieces)', 59.95, 'https://www.mangusahypermarket.com/product/tropic-tomato-paste-500gr-12-pieces/', 160, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Tropic Tomato paste 500gr (12 pieces)', 59.95, 'https://www.mangusahypermarket.com/product/tropic-tomato-paste-500gr-12-pieces/', 160, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Tropic Tomato paste 500gr (1 piece)', 5.15, 'https://www.mangusahypermarket.com/product/tropic-tomato-paste-500gr-1-piece/', 160, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Tropic Tomato paste 500gr (1 piece)', 5.15, 'https://www.mangusahypermarket.com/product/tropic-tomato-paste-500gr-1-piece/', 160, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Hardon Black tea 25pc (1 piece)', 2.9, 'https://www.mangusahypermarket.com/product/hardon-black-tea-25pc-1-piece/', 171, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Hardon Black tea 25pc (1 piece)', 2.9, 'https://www.mangusahypermarket.com/product/hardon-black-tea-25pc-1-piece/', 171, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Incolac Full cream milk powder can 400gr (24 pieces)', 212.88, 'https://www.mangusahypermarket.com/product/incolac-full-cream-milk-powder-can-400gr-24-pieces/', 193, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Incolac Full cream milk powder can 400gr (24 pieces)', 212.88, 'https://www.mangusahypermarket.com/product/incolac-full-cream-milk-powder-can-400gr-24-pieces/', 193, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Incolac Full cream milk powder can 400gr (1 piece)', 8.87, 'https://www.mangusahypermarket.com/product/incolac-full-cream-milk-powder-can-400gr-1-piece/', 193, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Incolac Full cream milk powder can 400gr (1 piece)', 8.87, 'https://www.mangusahypermarket.com/product/incolac-full-cream-milk-powder-can-400gr-1-piece/', 193, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Arm hammer Advance white breath freshing 6oz', 8.05, 'https://www.mangusahypermarket.com/product/arm-hammer-advance-white-breath-freshing-6oz/', 451, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Arm hammer Advance white breath freshing 6oz', 8.05, 'https://www.mangusahypermarket.com/product/arm-hammer-advance-white-breath-freshing-6oz/', 451, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'U kotex Maxi regular 24pc (6 pieces)', 80.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc-6-pieces/', 324, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'U kotex Maxi regular 24pc (6 pieces)', 80.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc-6-pieces/', 324, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'U kotex Maxi regular 24pc (1 piece)', 13.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc-1-piece/', 324, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'U kotex Maxi regular 24pc (1 piece)', 13.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc-1-piece/', 324, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'U kotex Maxi regular 24pc', 13.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc/', 324, 0.80, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'U kotex Maxi regular 24pc', 13.9, 'https://www.mangusahypermarket.com/product/u-kotex-maxi-regular-24pc/', 324, 0.80, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Chayota usa kl', 5.5, 'https://www.mangusahypermarket.com/product/chayota-usa-kl/', 342, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Chayota usa kl', 5.5, 'https://www.mangusahypermarket.com/product/chayota-usa-kl/', 342, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Papaya wh kl', 3.95, 'https://www.mangusahypermarket.com/product/papaya-wh-kl/', 383, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Papaya wh kl', 3.95, 'https://www.mangusahypermarket.com/product/papaya-wh-kl/', 383, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Granadilla kl', 10.95, 'https://www.mangusahypermarket.com/product/granadilla-kl/', 360, 0.82, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Granadilla kl', 10.95, 'https://www.mangusahypermarket.com/product/granadilla-kl/', 360, 0.82, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Lulo kl', 7.5, 'https://www.mangusahypermarket.com/product/lulo-kl/', 352, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Lulo kl', 7.5, 'https://www.mangusahypermarket.com/product/lulo-kl/', 352, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 800ml (6 pieces)', 38.12, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml-6-pieces/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 800ml (6 pieces)', 38.12, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml-6-pieces/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 800ml (1 piece)', 6.55, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml-1-piece/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 800ml (1 piece)', 6.55, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml-1-piece/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 800ml', 6.55, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml/', 128, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 800ml', 6.55, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-800ml/', 128, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 1200ml (6 pieces)', 52.09, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml-6-pieces/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 1200ml (6 pieces)', 52.09, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml-6-pieces/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 1200ml (1 piece)', 8.95, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml-1-piece/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 1200ml (1 piece)', 8.95, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml-1-piece/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 1200ml', 8.95, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml/', 127, 0.80, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 1200ml', 8.95, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-1200ml/', 127, 0.80, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 800ml (6 pieces)', 36.38, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-6-pieces-2/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 800ml (6 pieces)', 36.38, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-6-pieces-2/', 127, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 800ml (1 piece)', 6.25, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-1-piece-2/', 127, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 800ml (1 piece)', 6.25, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-1-piece-2/', 127, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Tomaten soep 800ml', 6.25, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-2/', 127, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Tomaten soep 800ml', 6.25, 'https://www.mangusahypermarket.com/product/jumbo-tomaten-soep-800ml-2/', 127, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 300ml (12 pieces)', 37.83, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml-12-pieces/', 128, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 300ml (12 pieces)', 37.83, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml-12-pieces/', 128, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 300ml (1 piece)', 3.25, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml-1-piece/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 300ml (1 piece)', 3.25, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml-1-piece/', 128, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Jumbo Erwten soep 300ml', 3.25, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml/', 128, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Jumbo Erwten soep 300ml', 3.25, 'https://www.mangusahypermarket.com/product/jumbo-erwten-soep-300ml/', 128, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Lipton Yellow label 25pc (24 pieces)', 90, 'https://www.mangusahypermarket.com/product/lipton-yellow-label-25pc-24-pieces/', 170, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Lipton Yellow label 25pc (24 pieces)', 90, 'https://www.mangusahypermarket.com/product/lipton-yellow-label-25pc-24-pieces/', 170, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-hyper', 'Lipton Yellow label 25pc (1 piece)', 3.75, 'https://www.mangusahypermarket.com/product/lipton-yellow-label-25pc-1-piece/', 170, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'mangusa-rio', 'Lipton Yellow label 25pc (1 piece)', 3.75, 'https://www.mangusahypermarket.com/product/lipton-yellow-label-25pc-1-piece/', 170, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Bloemkool roosjes', 25.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bloemkool-roosjes', 293, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Bloemkool roosjes', 25.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bloemkool-roosjes', 293, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Broccoli roosjes', 24.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/broccoli-roosjes', 276, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Broccoli roosjes', 24.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/broccoli-roosjes', 276, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Citroen los', 10.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/citroen-los', 263, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Citroen los', 10.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/citroen-los', 263, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Gember', 13.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/gember', 341, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Gember', 13.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/gember', 341, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Wortels los', 5.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/wortels-los', 331, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Wortels los', 5.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/wortels-los', 331, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Ananas', 7.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/ananas', 32, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Ananas', 7.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/ananas', 32, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Mango USA', 5.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mango-usa', 347, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Mango USA', 5.39, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mango-usa', 347, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Prei', 12.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/prei', 277, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Prei', 12.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/prei', 277, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Broccoli', 24.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/broccoli', 276, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Broccoli', 24.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/broccoli', 276, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Mais', 8.49, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mais', 261, 0.78, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Mais', 8.49, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mais', 261, 0.78, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Papaya heel', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/papaya-heel', 383, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Papaya heel', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/papaya-heel', 383, 0.74, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Grapefruit', 2.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/grapefruit', 356, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Grapefruit', 2.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/grapefruit', 356, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Baby carrots', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/baby-carrots', 401, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Baby carrots', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/baby-carrots', 401, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Bloemkool', 10.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bloemkool', 293, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Bloemkool', 10.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bloemkool', 293, 1.00, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Cilantro', 2.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/cilantro', 369, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Cilantro', 2.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/cilantro', 369, 0.77, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Bananen', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bananen', 298, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Bananen', 3.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/bananen', 298, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Mandarijnen USA', 16.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mandarijn-jaffa', 299, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Mandarijnen USA', 16.99, 'https://shopvdtcuracao.com/producten/aardappel-groente-fruit/mandarijn-jaffa', 299, 0.76, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Kipdrumsticks', 0.87, 'https://shopvdtcuracao.com/producten/vlees-kip-vis-vega/kipdrumsticks', 249, 0.82, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Kipdrumsticks', 0.87, 'https://shopvdtcuracao.com/producten/vlees-kip-vis-vega/kipdrumsticks', 249, 0.82, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'AH Grapefruitsap', 6.19, 'https://shopvdtcuracao.com/producten/frisdrank-koffie-thee-sappen/ah-grapefruitsap', 414, 0.79, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'AH Grapefruitsap', 6.19, 'https://shopvdtcuracao.com/producten/frisdrank-koffie-thee-sappen/ah-grapefruitsap', 414, 0.79, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'AH Spruitjes', 4.19, 'https://shopvdtcuracao.com/producten/diepvries/ah-spruitjes', 289, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'AH Spruitjes', 4.19, 'https://shopvdtcuracao.com/producten/diepvries/ah-spruitjes', 289, 0.81, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'AH Aardbeien gvp', 15.29, 'https://shopvdtcuracao.com/producten/diepvries/ah-aardbeien-gvp', 349, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'AH Aardbeien gvp', 15.29, 'https://shopvdtcuracao.com/producten/diepvries/ah-aardbeien-gvp', 349, 0.75, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-zeelandia', 'Bananen', 3.99, 'https://shopvdtcuracao.com/producten/prijsfavorieten/bananen', 298, 0.73, 'pending', 'scrape');
insert into scraped_prices (run_id, store_id, raw_name, raw_price, raw_url, matched_product_id, match_confidence, status, source)
values ((select max(id) from scrape_runs), 'vdt-janthiel', 'Bananen', 3.99, 'https://shopvdtcuracao.com/producten/prijsfavorieten/bananen', 298, 0.73, 'pending', 'scrape');

-- Product photo links from the scrape (image_url is a suggested source photo, not an admin upload;
-- only set when the product doesn't already have one, so this never overwrites a deliberate choice)
alter table products add column if not exists image_url text;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/321ee2fb-545b-4be3-a4dd-b03cfe8c2e21.octet-stream' where id = 171 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2021/07/9502037c-9293-4e15-b9c6-b14bafcb28ea.octet-stream' where id = 160 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/8e9f12a6-b279-4777-b66e-09237079b747.octet-stream' where id = 193 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2022/08/4d5391db-cd7f-4590-8069-b04a604de4e5.octet-stream' where id = 451 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2022/07/613a1b57-1b63-482c-8a32-68ba8c712b27.octet-stream' where id = 324 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/f9847d28-52d6-43ee-bc2e-d324aa1f1e4e.octet-stream' where id = 342 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/31021fb6-83cc-45b8-8729-dae8f3f63735.octet-stream' where id = 383 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/d258c149-d2c7-43e5-a725-8a4594b810ce.octet-stream' where id = 360 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2020/05/dfad8391-8729-4027-bce1-2abcb0ce912c.octet-stream' where id = 352 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2021/06/3302664a-1a8c-4e9c-9474-cbcc8b52252d.octet-stream' where id = 128 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2021/06/02835593-295a-4fde-b2c3-bb9b4ff8a73d.octet-stream' where id = 127 and image_url is null;
update products set image_url = 'https://www.mangusahypermarket.com/wp-content/uploads/2021/05/9a359a80-f46b-4a45-97ef-4d6b137f527c.octet-stream' where id = 170 and image_url is null;
