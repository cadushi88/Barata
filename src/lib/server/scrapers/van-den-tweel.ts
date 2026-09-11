import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

export const vanDenTweelScraper: StoreScraper = {
  chainId: "vdt",
  storeIds: ["vdt-zeelandia", "vdt-janthiel"],
  run: () => scrapeViaSitemapJsonLd("https://shopvdtcuracao.com"),
};
