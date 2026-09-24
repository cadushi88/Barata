import type { StoreScraper } from "./types";
import { scrapeViaSitemapJsonLd } from "./generic-jsonld";

// DeliNova is a Willemstad hospitality/specialty wholesaler (meat, fish,
// cheese, produce, dry goods) that opened its webshop to individual
// customers with home delivery; found during Day 10 catalog research
// (2026-09-24) as a genuinely new, per-item priced Curaçao webshop.
// The priced catalog lives on the `orders.` subdomain, not the marketing
// site at deli-nova.com itself.
export const delinovaScraper: StoreScraper = {
  chainId: "delinova",
  storeIds: ["delinova"],
  run: () => scrapeViaSitemapJsonLd("https://orders.deli-nova.com"),
};
