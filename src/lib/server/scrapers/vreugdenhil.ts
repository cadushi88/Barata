import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

/**
 * Unlike the others, general research turned up no confirmed online ordering
 * system for Vreugdenhil — it may simply not publish prices online. If so
 * this legitimately returns zero items every run; that's a real result, not
 * a scraper bug, and shows up as such on the review page rather than an error.
 */
export const vreugdenhilScraper: StoreScraper = {
  chainId: "vreugdenhil",
  storeIds: ["vreugdenhil"],
  run: () => scrapeViaSitemapJsonLd("https://vreugdenhil.cw"),
};
