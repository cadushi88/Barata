import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

export const mangusaScraper: StoreScraper = {
  chainId: "mangusa",
  storeIds: ["mangusa-hyper", "mangusa-rio"],
  run: () => scrapeViaSitemapJsonLd("https://www.mangusahypermarket.com"),
};
