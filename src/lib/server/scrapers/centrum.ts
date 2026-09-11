import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

export const centrumScraper: StoreScraper = {
  chainId: "centrum",
  storeIds: ["centrum-mahaai", "centrum-piscadera"],
  run: () => scrapeViaSitemapJsonLd("https://centrumsupermarket.com"),
};
