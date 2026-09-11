import type { ScrapedItem } from "./types";

/**
 * Best-effort scraper for stores whose webshop platform we don't know (unlike
 * Goisco's confirmed Shopify setup). Rather than guess one site's markup, this
 * leans on two conventions common across most e-commerce platforms:
 *
 *  1. `sitemap.xml` (and any nested sitemaps it points to) to discover product
 *     page URLs without needing to know the site's category structure.
 *  2. Schema.org `Product` JSON-LD (`<script type="application/ld+json">`),
 *     which most storefronts embed for search-engine rich results — the same
 *     block Google reads for pricing, so it's usually accurate and, being
 *     JSON, far more stable to parse than the rendered HTML around it.
 *
 * This can legitimately come back empty for a store that has no online price
 * list at all, or that we can't fetch — the caller records that as this
 * store's result for the run rather than treating it as a scraper bug.
 */

const MAX_SITEMAP_URLS = 500;
const MAX_PRODUCT_PAGES = 300;
const FETCH_TIMEOUT_MS = 10_000;
const CONCURRENCY = 8;

async function fetchText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { accept: "text/html,application/xml,*/*", "user-agent": "BarataPriceBot/1.0 (+https://barata.app)" },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

function extractLocs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}

/** A URL path segment that most storefronts use for an individual product page (Dutch included, since several Curaçao stores label in Dutch). */
const PRODUCT_URL_HINT = /\/(products?|producten|artikel|item)\//i;

async function discoverProductUrls(baseUrl: string): Promise<string[]> {
  const rootXml = await fetchText(`${baseUrl}/sitemap.xml`);
  if (!rootXml) return [];

  const rootLocs = extractLocs(rootXml);
  // A sitemap index points to child sitemaps (also *.xml); a flat sitemap points
  // straight at pages. Treat any *.xml loc as a child sitemap to fetch.
  const childSitemaps = rootLocs.filter((u) => u.endsWith(".xml")).slice(0, 40);
  const pageUrls = rootLocs.filter((u) => !u.endsWith(".xml"));

  if (childSitemaps.length > 0) {
    const childResults = await Promise.all(childSitemaps.map((u) => fetchText(u)));
    for (const xml of childResults) {
      if (!xml) continue;
      pageUrls.push(...extractLocs(xml).filter((u) => !u.endsWith(".xml")));
      if (pageUrls.length >= MAX_SITEMAP_URLS) break;
    }
  }

  const productUrls = pageUrls.filter((u) => PRODUCT_URL_HINT.test(u));
  // Fall back to every page found if nothing matched the hint — some sites use
  // an unrecognized path shape, and a same-domain page is still worth a
  // JSON-LD check rather than yielding zero items.
  const candidates = productUrls.length > 0 ? productUrls : pageUrls;
  return candidates.slice(0, MAX_SITEMAP_URLS);
}

type JsonLdOffer = { price?: string | number; priceCurrency?: string };
type JsonLdProduct = {
  "@type"?: string | string[];
  name?: string;
  offers?: JsonLdOffer | JsonLdOffer[];
  "@graph"?: JsonLdProduct[];
};

function isProductType(t: JsonLdProduct["@type"]): boolean {
  if (!t) return false;
  return Array.isArray(t) ? t.includes("Product") : t === "Product";
}

function extractProductsFromJsonLd(html: string, pageUrl: string): ScrapedItem[] {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const items: ScrapedItem[] = [];
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1].trim());
    } catch {
      continue;
    }
    const candidates: JsonLdProduct[] = Array.isArray(parsed)
      ? (parsed as JsonLdProduct[])
      : [parsed as JsonLdProduct];
    for (const node of candidates) {
      const nested = node["@graph"] ?? [];
      for (const p of [node, ...nested]) {
        if (!isProductType(p["@type"]) || !p.name) continue;
        const offers = Array.isArray(p.offers) ? p.offers : p.offers ? [p.offers] : [];
        for (const offer of offers) {
          const price = Number(offer.price);
          if (!Number.isFinite(price) || price <= 0) continue;
          items.push({ name: p.name, unit: null, price, url: pageUrl });
        }
      }
    }
  }
  return items;
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function scrapeViaSitemapJsonLd(baseUrl: string): Promise<ScrapedItem[]> {
  const productUrls = (await discoverProductUrls(baseUrl)).slice(0, MAX_PRODUCT_PAGES);
  if (productUrls.length === 0) return [];
  const perPage = await mapWithConcurrency(productUrls, CONCURRENCY, async (url) => {
    const html = await fetchText(url);
    return html ? extractProductsFromJsonLd(html, url) : [];
  });
  return perPage.flat();
}
