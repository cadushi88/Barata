import type { ScrapedItem, StoreScraper } from "./types";

/**
 * Curaçao Foods Trade (curfoods.com) — a Willemstad food/non-food distributor
 * (established 1967) whose storefront serves both wholesale accounts and
 * individual retail customers with real NAf per-item prices; found during
 * Day 15 catalog research (2026-09-29) as a genuinely new, per-item priced
 * Curaçao webshop. Its `/products` collection pages and `/pages/wholesale`
 * URL shape match Shopify's conventions (the same platform confirmed for
 * Goisco), so this reuses that store's `/products.json` approach rather than
 * the generic sitemap/JSON-LD scraper.
 */
const BASE_URL = "https://curfoods.com";
const PAGE_SIZE = 250;
/** Hard cap so a runaway catalog (or an unexpected redirect loop) can't turn one run into thousands of requests. */
const MAX_PAGES = 20;

type ShopifyVariant = { price: string; title: string };
type ShopifyProduct = { title: string; handle: string; variants: ShopifyVariant[] };
type ShopifyProductsResponse = { products: ShopifyProduct[] };

async function fetchPage(page: number): Promise<ShopifyProduct[]> {
  const res = await fetch(`${BASE_URL}/products.json?limit=${PAGE_SIZE}&page=${page}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`CurFoods products.json returned ${res.status}`);
  const data = (await res.json()) as ShopifyProductsResponse;
  return data.products ?? [];
}

async function run(): Promise<ScrapedItem[]> {
  const items: ScrapedItem[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const products = await fetchPage(page);
    if (products.length === 0) break;
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        const price = Number(variant.price);
        if (!Number.isFinite(price) || price <= 0) continue;
        const hasRealVariant = variant.title && variant.title !== "Default Title";
        items.push({
          name: product.title,
          unit: hasRealVariant ? variant.title : null,
          price,
          url: `${BASE_URL}/products/${product.handle}`,
        });
      }
    }
    if (products.length < PAGE_SIZE) break;
  }
  return items;
}

export const curfoodsScraper: StoreScraper = {
  chainId: "curfoods",
  storeIds: ["curfoods"],
  run,
};
