/** One priced item read off a store's own website, before any matching against the catalog. */
export type ScrapedItem = {
  name: string;
  /** Free-text size/unit as printed on the site, e.g. "500 gr" or a Shopify variant name. Null when the site gives no hint. */
  unit: string | null;
  price: number;
  /** Product page URL, kept for the reviewer to double-check a surprising price. */
  url?: string;
};

/** One store chain's scraper. `storeIds` lists every `stores` row this chain's webshop price applies to (a chain can have several physical locations sharing one online price list). */
export type StoreScraper = {
  chainId: string;
  storeIds: string[];
  run: () => Promise<ScrapedItem[]>;
};
