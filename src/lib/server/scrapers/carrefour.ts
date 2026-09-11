import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

/**
 * Like Vreugdenhil, general research found no confirmed online shopping
 * platform for Carrefour Market Curaçao (crfrcuracao.com describes the
 * physical store, not a webshop) — zero items back is an expected, real
 * result here, not necessarily a broken scraper.
 */
export const carrefourScraper: StoreScraper = {
  chainId: "carrefour",
  storeIds: ["carrefour"],
  run: () => scrapeViaSitemapJsonLd("https://www.crfrcuracao.com"),
};
