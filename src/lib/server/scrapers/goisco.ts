import type { ScrapedItem, StoreScraper } from "./types";

/**
 * Goisco's storefront is Shopify (its collection URLs follow Shopify's
 * `/collections/<handle>` convention — see migrations/0015-0018, scraped by
 * hand from screenshots before this scraper existed). Every Shopify store
 * that hasn't explicitly disabled it serves a public, unauthenticated
 * `/products.json` feed meant for storefront apps — far more reliable than
 * parsing rendered HTML, so this is the primary path rather than a fallback.
 */
const BASE_URL = "https://goisco.com";
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
  if (!res.ok) throw new Error(`Goisco products.json returned ${res.status}`);
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

export const goiscoScraper: StoreScraper = {
  chainId: "goisco",
  storeIds: ["goisco"],
  run,
};
