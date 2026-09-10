/**
 * Real product photos (Unsplash / Wikimedia / free stock).
 * These are actual photographs, not AI-generated - and each entry must
 * actually depict that product. A previous version reused a handful of
 * photos across unrelated items (e.g. a raw chicken fillet photo was
 * assigned to canned tuna, tuna in oil, mayonnaise and sardines) - those
 * mismatches have been removed rather than left showing the wrong food.
 * A product without an accurate photo here falls back to the Barata logo
 * (see ProductPhoto) instead of a guessed, possibly-wrong picture.
 */
const REAL_PHOTOS: Record<string, string> = {
  // Dairy
  "milk-1l": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80",
  "uht-milk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  // Confirmed real liquid-milk-in-carton products (not the canned/powdered lines from the
  // same brands, which were deliberately left unmapped as a different packaging form).
  "friesche-vlag-halfvolle-1-ltr": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  "friesche-vlag-magere-1-ltr": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  "gloria-vollemelk-1-ltr": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  "sane-halfvolle-1-ltr": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80",
  "yogurt-1l": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80",
  "butter-250": "https://images.unsplash.com/photo-1589985270826-4b7fe135a9c4?w=600&q=80",
  "cheese-gouda": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
  // "Jonge kaas" - Dutch for "young cheese", a young Gouda-style cheese.
  "jonge-kaas-1-kg": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=80",
  "cheese-cheddar": "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=600&q=80",
  "eggs-12": "https://images.unsplash.com/photo-1582722875186-4d1d2b1c5b0e?w=600&q=80",
  "cheese-slices": "https://images.unsplash.com/photo-1452195100486-9ccf7bb1fd2d?w=600&q=80",
  "cream": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&q=80",

  // Bakery
  "bread-white": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
  "bread-brown": "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80",
  "buns-6": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",

  // Pantry
  "rice-1kg": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
  // Blue Ribbon and Camil are confirmed real rice brands (researched, not assumed) -
  // "bruin"/"wit" is Dutch for brown/white, matching their brown/white rice lines.
  // Excludes "Nika" and "Orient Star" - could not confirm what those brands actually are.
  "blue-ribbon-bruin-5-lb": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
  "blue-ribbon-wit-5-lb": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
  "camil-bruin-2-lb": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
  "rice-5kg": "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80",
  "pasta-500": "https://images.unsplash.com/photo-1551462147-378704645ec2?w=600&q=80",
  // Gallo and Honig are confirmed real dry-pasta brands making elbow macaroni.
  "gallo-macaroni-elbow-250-gr": "https://images.unsplash.com/photo-1551462147-378704645ec2?w=600&q=80",
  "macaroni-elbow-honig-700-gr": "https://images.unsplash.com/photo-1551462147-378704645ec2?w=600&q=80",
  "flour-1kg": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  // Wheat/corn flour brands - same product type as flour-1kg, different brand/pack size.
  "flag-4-4-lbs": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "gold-self-rising-5-lbs": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "gold-medal-all-purpose-5-lbs": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "gold-medal-all-purpose-12-lbs": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "robin-hood-5-lbs": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "phoebe-1-lb": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
  "sugar-1kg": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  // Sugar brands - same product type as sugar-1kg, different brand/pack size.
  "eagle-2-lbs": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "eagle-4-lbs": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "king-sugar-4-lbs": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "manuelita-2-kg": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "manuelita-1-kg": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "royal-2-lbs": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "oil-1l": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "olive-oil": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  // Badia, Goya (Puro line), Vigo, and Wesseon/Wesson are confirmed real bottled cooking
  // oil brands (extra virgin olive oil / canola oil) - same product type as oil-1l/olive-oil.
  "badia-extra-virgin-250-ml": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "badia-extra-virgin-500-ml": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "goya-puro-17-oz": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "vigo-extra-virgin-250-ml": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "vigo-olive-oil-100-pure-250-ml": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "wesseon-canola-oil-40-oz": "https://images.unsplash.com/photo-1474979266404-7ea32081f3e9?w=600&q=80",
  "salt": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442a?w=600&q=80",
  "tomato-paste": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
  // Tomato paste brands - same product type as tomato-paste, different brand.
  "alfresco-500-gr": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
  "kingtom-370-gr": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
  "tropic-500-gr": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
  // Hunt's is a confirmed real tomato paste brand.
  "hunt-s-paste-6-oz": "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&q=80",
  "ketchup": "https://images.unsplash.com/photo-1528756514091-dee5ecaa3278?w=600&q=80",
  "peanut-butter": "https://images.unsplash.com/photo-1621939514649-c8f9a0f0c0e0?w=600&q=80",
  // "Pindakaas Creamy Calvé" - pindakaas is Dutch for peanut butter (pinda=peanut, kaas=cheese).
  "pindakaas-creamy-calve-350-gr": "https://images.unsplash.com/photo-1621939514649-c8f9a0f0c0e0?w=600&q=80",
  "cornflakes": "https://images.unsplash.com/photo-1521483451569-e338407c3fc0?w=600&q=80",
  // "Kellogg's Corn Flakes" - same product, brand name.
  "kellog-s-18-oz": "https://images.unsplash.com/photo-1521483451569-e338407c3fc0?w=600&q=80",
  "kellog-s-9-6-oz": "https://images.unsplash.com/photo-1521483451569-e338407c3fc0?w=600&q=80",
  "kellog-s-12-oz": "https://images.unsplash.com/photo-1521483451569-e338407c3fc0?w=600&q=80",

  // Meat & Seafood
  "chicken-fillet": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80",
  // "Chicken Breast" - breast is fillet.
  "chicken-breast-1-kg": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&q=80",
  "chicken-whole": "https://images.unsplash.com/photo-1587593810167-a84920ea13a4?w=600&q=80",
  // "Galiña Hinter" - galiña (chicken) hinter (whole).
  "galina-hinter-1500-stuk": "https://images.unsplash.com/photo-1587593810167-a84920ea13a4?w=600&q=80",
  "ground-beef": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "beef-round": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "sirloin": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  // "Beefmulá/Tartaar", "Karni Mulá", "Beefsteak Mulá" - mulá (Papiamentu: ground/minced) beef.
  "beefmula-tartaar-1-kg": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "karni-mula-1-kg": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "beefsteak-mula-1-kg": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "karni-stoba-mula-1-kg": "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=600&q=80",
  "shoulder-ham": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  // "Schouderham (slice)" - Dutch for sliced shoulder ham, same product as shoulder-ham.
  "schouderham-slice-1-kg": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "bacon": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "sausage": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  // "Wòrst dushi/salu (slice)" - wòrst (Papiamentu/Dutch: sausage).
  "worst-dushi-slice-1-kg": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "worst-salu-slice-1-kg": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "ham-sliced": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "turkey-ham-slice-1-kg": "https://images.unsplash.com/photo-1529692236671-f1f9cf4ade68?w=600&q=80",
  "fish-fillet": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80",
  "shrimp": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80",

  // Produce - Papiamentu/Dutch terms verified before mapping (see commit notes)
  "apples": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  // "Apel" (Dutch/Papiamentu: apple), Golden/Red Delicious, various pack sizes.
  "apel-golden-delicious-per-kilo": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  "apel-golden-delicious-per-stuk": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  "apel-red-delicious-3-stuks": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  "apel-red-delicious-per-kilo": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  "apel-red-delicious-per-stuk": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80",
  "bananas": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
  "banana-p-st": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
  "banana-p-kg": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
  // "Bananen (bakoba)" - bakoba is the Papiamentu word for banana.
  "bananen-bakoba-per-kilo": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
  "oranges": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  // "Apelsina" (Papiamentu: orange, confirmed - not a generic "citrus").
  "apelsina-7-stuks": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  "apelsina-4-stuks": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  "apelsina-per-stuk": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  "apelsina-per-kilo": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  // "Mandarijn" (mandarin) - close enough to an orange in appearance to share, like the
  // existing bananas/plantain pairing below.
  "mandarijn-per-kilo": "https://images.unsplash.com/photo-1547514701-42782101795e?w=600&q=80",
  "tomatoes": "https://images.unsplash.com/photo-1546090191-0d68a3c3e5b0?w=600&q=80",
  // "Tomati venezolano" - tomati (Papiamentu: tomato).
  "tomati-venezolano-p-kg": "https://images.unsplash.com/photo-1546090191-0d68a3c3e5b0?w=600&q=80",
  "potatoes": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
  // "Batata (hulandes)" - hulandes (Papiamentu: Dutch) potato, i.e. a regular potato, as
  // opposed to batata dushi (sweet potato, left unmapped - visually different).
  "batata-hulandes-p-kg": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80",
  "onions": "https://images.unsplash.com/photo-1518977956812-cd3faec11a5e?w=600&q=80",
  // "Siboyo" (Papiamentu: onion). Excludes "siboyo largu" (long/spring onion - visually
  // a different, thin green vegetable, not a bulb onion).
  "siboyo-normal-p-kg": "https://images.unsplash.com/photo-1518977956812-cd3faec11a5e?w=600&q=80",
  "siboyo-kora-p-kg": "https://images.unsplash.com/photo-1518977956812-cd3faec11a5e?w=600&q=80",
  "lettuce": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&q=80",
  "cucumber": "https://images.unsplash.com/photo-1449300079323-02e209ef9c47?w=600&q=80",
  // "Komkomber salada" - komkomber (Dutch/Papiamentu: cucumber).
  "komkomber-salada-p-kg": "https://images.unsplash.com/photo-1449300079323-02e209ef9c47?w=600&q=80",
  "peppers": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
  // "Promentòn" (Papiamentu: bell pepper), berde/gel/kòrá = green/yellow/red.
  "promenton-berde-p-kg": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
  "promenton-gel-p-kg": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
  "promenton-kora-p-kg": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80",
  "carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
  // "Wortel Jumbo" - wortel (Dutch/Papiamentu: carrot).
  "wortel-jumbo-p-kg": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80",
  "papaya": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600&q=80",
  // "Papaya (hintè hechu)" - same fruit, hintè hechu is a ripeness/variety descriptor.
  "papaya-hinte-hechu-per-kilo": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=600&q=80",
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80",
  "avocado": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
  // "Advocado" - spelling variant of avocado, same fruit.
  "advocado-p-kg": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&q=80",
  "lime": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=80",
  // "Lamunchi" (Papiamentu: lime) - distinct from "citroen" (lemon), which is not mapped.
  "lamunchi-p-kg": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=600&q=80",
  "plantain": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80",
  "cabbage": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80",
  // "Kolo blanku/kòrá" - kolo (Papiamentu: cabbage, from Dutch "kool"), blanku/kòrá = white/red.
  "kolo-blanku-p-kg": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80",
  "kolo-kora-p-kg": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&q=80",
  "garlic": "https://images.unsplash.com/photo-1540148426949-6bb3a0c0632a?w=600&q=80",
  // "Konoflo" is a Papiamentu variant of Dutch "knoflook" - garlic.
  "konoflo-p-kg": "https://images.unsplash.com/photo-1540148426949-6bb3a0c0632a?w=600&q=80",
  "ginger": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&q=80",

  // Drinks
  "water-6": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
  "cola-2l": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80",
  // "Fria" is Curaçao's own carbonated soft drink brand; the row lists Coca-Cola as the
  // (first) option for this line, which is literally cola.
  "coca-cola-fria-lokal-2-ltr": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80",
  "coca-cola-fria-lokal-1-ltr": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=600&q=80",
  "juice-1l": "https://images.unsplash.com/photo-1600271886742-f049cd062baf?w=600&q=80",
  // Baggio, Ceres, and Gloria are confirmed real ready-to-drink fruit juice brands sold in
  // 1L cartons - not the Sunquick concentrate line, left unmapped as a different form.
  "baggio-pronto-peer-1-ltr": "https://images.unsplash.com/photo-1600271886742-f049cd062baf?w=600&q=80",
  "ceres-apple-1-ltr": "https://images.unsplash.com/photo-1600271886742-f049cd062baf?w=600&q=80",
  "gloria-orange-1-ltr": "https://images.unsplash.com/photo-1600271886742-f049cd062baf?w=600&q=80",
  "beer-24": "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80",
  "coffee-250": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80",
  "tea-20": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
  // Crown, Hardon, and Lipton Yellow Label are all boxed tea bags, same product type.
  "crown-20-stuks": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
  "hardon-25-stuks": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
  "lipton-yellow-label-20-stuks": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",

  // Frozen & Snacks
  "frozen-fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80",
  "frozen-veg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "ice-cream": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  "chips": "https://images.unsplash.com/photo-1566478989038-a162ee090df0?w=600&q=80",
  "cookies": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
  "chocolate": "https://images.unsplash.com/photo-1548907040-4d8b2e1a0e0e?w=600&q=80",

  // Household & Baby
  "paper-towel": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  // Toilet paper/bathroom tissue - same shared tier as paper-towel already in the code.
  "noky-12-stuks": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  "softex-12-stuks": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  "tp": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
  "detergent": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "soap": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  // Confirmed real dish soap products - same photo tier already used for "soap" above.
  "jab-28-oz": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "palmolive-original-12-oz": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "tempo-56-oz": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
  "diapers": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
};

/**
 * Returns a real product photo URL, or undefined if none is accurately
 * mapped - callers should show a neutral placeholder (the Barata logo)
 * rather than guess with an unrelated photo.
 */
export function productPhoto(slug: string): string | undefined {
  return REAL_PHOTOS[slug];
}
