import type { StoreScraper } from "./types";

/**
 * vreugdenhil.cw's sitemap/JSON-LD does NOT describe real inventory — it
 * serves storefront-template placeholder products ("Awesome Wool Knife",
 * "Gorgeous Aluminum Bottle", "Synergistic Granite Coat" — the exact
 * "[adjective] [material] [noun]" pattern of faker.js's fake-commerce
 * generator, seeded by whatever e-commerce platform/theme runs that site).
 * Confirmed by inspecting rows it staged into scraped_prices: nonsense
 * product names at nonsense prices (XCG 300-900 for a "Steel Shoes"),
 * matching nothing in the catalog. Scraping it was actively harmful — it
 * filled the admin review queue with junk on every run — so this returns
 * nothing rather than trusting that feed. Revisit only if Vreugdenhil is
 * confirmed to run a real webshop on a different domain/path.
 */
export const vreugdenhilScraper: StoreScraper = {
  chainId: "vreugdenhil",
  storeIds: ["vreugdenhil"],
  run: async () => [],
};
