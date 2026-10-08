import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

// Best Buy Supermarket (Willemstad, bestbuycuracao.com) — a wholesale grocer
// whose webshop lists real per-item prices in Antillean guilders (confirmed
// via search-indexed product pages, e.g. a 400gr powder item at ƒ5.50); found
// during Day 24 catalog research (2026-10-08) as a genuinely new, per-item
// priced Curaçao webshop. The `best-buy` store row already exists (seeded by
// an earlier Fundashon pa Konsumidó survey import, migration 0007) with no
// scraper registered against it until now — no new migration needed.
export const bestBuyScraper: StoreScraper = {
  chainId: "best-buy",
  storeIds: ["best-buy"],
  run: () => scrapeViaSitemapJsonLd("https://bestbuycuracao.com"),
};
