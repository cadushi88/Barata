import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";

export type StoreRow = {
  id: string;
  name: string;
  area: string;
  address: string | null;
  hours: string | null;
  price_tier: string;
};

export type ProductRow = {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  unit: string;
  needs_review: boolean;
};

export type PriceRow = {
  product_id: number;
  store_id: string;
  store_name: string;
  amount: string;
  observed_at: string;
  source: string;
};

export const listStores = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<StoreRow>`
    select id, name, area, address, hours, price_tier
    from stores
    order by
      case price_tier when 'budget' then 0 when 'mid' then 1 else 2 end,
      name
  `;
});

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql<{ category: string; n: number }>`
    select category, count(*)::int as n from products group by category order by category
  `;
});

export const getCatalogStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [{ n: storeCount }] = await sql<{ n: number }>`select count(*)::int as n from stores`;
  const [{ n: productCount }] = await sql<{ n: number }>`select count(*)::int as n from products`;
  return { storeCount, productCount };
});

/**
 * Upper bound on a single reported price (XCG). Enforced on EVERY path that
 * writes to `prices` — manual reports and receipt commits alike — so no endpoint
 * becomes the soft spot for poisoning the public catalog.
 */
export const MAX_PRICE_XCG = 9999;

/** How many products one basket comparison may span (the comparison is O(ids²·stores)). */
const MAX_BASKET_ITEMS = 500;

export const searchProducts = createServerFn({ method: "GET" })
  .validator((input: { q?: string; category?: string }) =>
    z
      .object({
        q: z.string().max(200).optional(),
        category: z.string().max(80).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = (data.q ?? "").trim().toLowerCase();
    const cat = (data.category ?? "").trim();
    // `%` and `_` are LIKE wildcards, so an unescaped query typed by a shopper is
    // matched as a pattern: "_" listed the entire catalog and "100%" matched any
    // name containing "100". Escape them (and the escape char) to search literally.
    const like = "%" + q.replace(/([\\%_])/g, "\\$1") + "%";
    const products = await sql<ProductRow>`
      select id, slug, name, brand, category, unit, needs_review
      from products
      where (${q.length === 0}
             or lower(name) like ${like} escape '\\'
             or lower(coalesce(brand,'')) like ${like} escape '\\')
        and (${cat.length === 0} or category = ${cat})
      order by name
    `;
    const latest = await sql<{ product_id: number; store_name: string; amount: string }>`
      select distinct on (p.product_id, p.store_id)
        p.product_id, s.name as store_name, p.amount::text as amount
      from prices p
      join stores s on s.id = p.store_id
      -- p.id desc breaks observed_at ties deterministically (newest insert wins):
      -- commitReceipt stamps every line of a receipt with the same purchase-date
      -- timestamp, so a corrected re-upload would otherwise be a coin flip.
      order by p.product_id, p.store_id, p.observed_at desc, p.id desc
    `;
    const byProduct = new Map<number, { amount: number; store: string }[]>();
    for (const row of latest) {
      const list = byProduct.get(row.product_id) ?? [];
      list.push({ amount: Number(row.amount), store: row.store_name });
      byProduct.set(row.product_id, list);
    }
    return products.map((pr) => {
      const prices = (byProduct.get(pr.id) ?? []).sort((a, b) => a.amount - b.amount);
      return {
        ...pr,
        min_price: prices[0] ? String(prices[0].amount) : null,
        max_price: prices.length ? String(prices[prices.length - 1].amount) : null,
        cheapest_store: prices[0]?.store ?? null,
      };
    });
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    // A hand-typed URL like /products/abc reaches us as NaN. Treat it as "no such
    // product" rather than letting Postgres reject the parameter — otherwise the
    // page sits on a blank skeleton while React Query retries the failing call.
    if (!Number.isSafeInteger(data.id)) return { product: null, prices: [] as PriceRow[] };
    const sql = await getSql();
    const products = await sql<ProductRow>`
      select id, slug, name, brand, category, unit, needs_review from products where id = ${data.id}
    `;
    const product = products[0] ?? null;
    const prices = await sql<PriceRow>`
      select distinct on (p.store_id)
        p.product_id, p.store_id, s.name as store_name, p.amount::text as amount,
        p.observed_at::text as observed_at, p.source
      from prices p
      join stores s on s.id = p.store_id
      where p.product_id = ${data.id}
      -- p.id desc breaks observed_at ties deterministically (newest insert wins):
      -- commitReceipt stamps every line of a receipt with the same purchase-date
      -- timestamp, so a corrected re-upload would otherwise be a coin flip.
      order by p.store_id, p.observed_at desc, p.id desc
    `;
    prices.sort((a, b) => Number(a.amount) - Number(b.amount));
    return { product, prices };
  });

export const getStore = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => z.object({ id: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const stores = await sql<StoreRow>`
      select id, name, area, address, hours, price_tier from stores where id = ${data.id}
    `;
    const store = stores[0] ?? null;
    const items = await sql<
      ProductRow & { amount: string; observed_at: string }
    >`
      select distinct on (pr.id)
        pr.id, pr.slug, pr.name, pr.brand, pr.category, pr.unit, pr.needs_review,
        p.amount::text as amount, p.observed_at::text as observed_at
      from products pr
      join prices p on p.product_id = pr.id
      where p.store_id = ${data.id}
      -- p.id desc breaks observed_at ties deterministically (newest insert wins):
      -- commitReceipt stamps every line of a receipt with the same purchase-date
      -- timestamp, so a corrected re-upload would otherwise be a coin flip.
      order by pr.id, p.observed_at desc, p.id desc
    `;
    items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return { store, items };
  });

export type BasketLine = {
  product_id: number;
  name: string;
  /** Quantity requested from the shopping list. */
  qty: number;
  /** Unit price at this store, or null when the store doesn't carry the item. */
  amount: number | null;
  /** `amount * qty`, or null when the store doesn't carry the item. */
  lineTotal: number | null;
};

export type BasketStore = {
  store: StoreRow;
  total: number;
  missing: number;
  lines: BasketLine[];
};

export type SplitSavings = {
  mixAndMatchTotal: number;
  /** Total at the cheapest store that carries EVERY item, or null when none does. */
  oneStopTotal: number | null;
  /** Whether any store carries every item — when false, `maxSavings` is 0 by definition, not "no benefit to splitting". */
  oneStopComplete: boolean;
  storeCount: number;
  storeNames: string[];
  maxSavings: number;
  worthIt: boolean;
  perItem: { product_id: number; store: StoreRow; amount: number; qty: number; lineTotal: number; name: string }[];
};

export const cheapestBasket = createServerFn({ method: "GET" })
  .validator((input: { items: { productId: number; qty?: number }[] }) =>
    z
      .object({
        // Bounded: the per-item "best store" pass is O(items² · stores), so an
        // unbounded item list from a (public, unauthenticated) caller would pin
        // the server until the request timed out.
        items: z
          .array(
            z.object({
              productId: z.number().int().positive(),
              qty: z.number().positive().max(999).optional(),
            }),
          )
          .max(MAX_BASKET_ITEMS),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Collapse duplicates and normalize quantities: the shopping list stores a qty
    // per product, and a basket of "3 x milk" must cost three times one milk.
    const wanted = new Map<number, number>();
    for (const it of data.items) {
      const safeQty = it.qty ?? 1;
      wanted.set(it.productId, (wanted.get(it.productId) ?? 0) + safeQty);
    }
    const ids = [...wanted.keys()];
    if (ids.length === 0)
      return {
        stores: [] as BasketStore[],
        splitSavings: null as SplitSavings | null,
      };
    const sql = await getSql();
    const stores = await sql<StoreRow>`select id, name, area, address, hours, price_tier from stores`;
    // Names come from the catalog, not from the price join, so a line a store does
    // not stock still reads as the product's name instead of a bare "#123".
    const named = await sql<{ id: number; name: string }>`
      select id, name from products where id = any(${ids})
    `;
    const nameById = new Map(named.map((p) => [p.id, p.name]));
    const latest = await sql<{ product_id: number; store_id: string; amount: string; name: string }>`
      select distinct on (p.product_id, p.store_id)
        p.product_id, p.store_id, p.amount::text as amount, pr.name
      from prices p
      join products pr on pr.id = p.product_id
      -- p.id desc breaks observed_at ties deterministically (newest insert wins):
      -- commitReceipt stamps every line of a receipt with the same purchase-date
      -- timestamp, so a corrected re-upload would otherwise be a coin flip.
      order by p.product_id, p.store_id, p.observed_at desc, p.id desc
    `;
    const idSet = new Set(ids);
    const byStore = new Map<string, { product_id: number; name: string; amount: number }[]>();
    for (const row of latest) {
      if (!idSet.has(row.product_id)) continue;
      const list = byStore.get(row.store_id) ?? [];
      list.push({ product_id: row.product_id, name: row.name, amount: Number(row.amount) });
      byStore.set(row.store_id, list);
    }
    const result: BasketStore[] = stores.map((store) => {
      const found = byStore.get(store.id) ?? [];
      const map = new Map(found.map((f) => [f.product_id, f]));
      const lines: BasketLine[] = ids.map((id) => {
        const f = map.get(id);
        const qty = wanted.get(id) ?? 1;
        // Names come from the catalog, not just the price join, so a line a store does
        // not stock still reads as the product's name instead of a bare "#123".
        return {
          product_id: id,
          name: nameById.get(id) ?? f?.name ?? `#${id}`,
          qty,
          amount: f ? f.amount : null,
          lineTotal: f ? f.amount * qty : null,
        };
      });
      const priced = lines.filter((l) => l.lineTotal != null);
      const total = priced.reduce((s, l) => s + (l.lineTotal ?? 0), 0);
      return { store, total, missing: ids.length - priced.length, lines };
    });
    result.sort((a, b) => {
      if (a.missing !== b.missing) return a.missing - b.missing;
      return a.total - b.total;
    });

    // Mix-and-match: what if you bought each item at whichever store has it cheapest?
    // This is the "chicken is cheaper at Mangusa, but the whole bill is cheaper at Goisco"
    // comparison — shows the ceiling on savings from splitting your trip, and how many
    // stops that would actually take, so the person can weigh it against the hassle.
    const perItemBest = ids.map((id) => {
      let best: { store: StoreRow; amount: number; qty: number; lineTotal: number; name: string } | null = null;
      for (const s of result) {
        const line = s.lines.find((l) => l.product_id === id);
        if (line?.amount != null && (!best || line.amount < best.amount)) {
          best = {
            store: s.store,
            amount: line.amount,
            qty: line.qty,
            lineTotal: line.lineTotal ?? line.amount * line.qty,
            name: line.name,
          };
        }
      }
      return best ? { product_id: id, ...best } : null;
    });
    const foundBest = perItemBest.filter((b): b is NonNullable<typeof b> => b !== null);
    const mixAndMatchTotal = foundBest.reduce((s, b) => s + b.lineTotal, 0);
    const storesNeeded = new Set(foundBest.map((b) => b.store.id));
    // Only a store that carries EVERY item is a real one-stop alternative. Falling back
    // to the fewest-missing store would compare its *partial* basket against the full
    // mix-and-match basket and invent a saving out of the items it simply doesn't stock.
    // When no store is complete, splitting isn't a real choice, so say so explicitly
    // instead of silently hiding the block or reporting a manufactured saving of zero.
    const oneStopBest = result.find((s) => s.missing === 0) ?? null;
    const maxSavings = oneStopBest ? Math.max(0, oneStopBest.total - mixAndMatchTotal) : 0;

    const splitSavings: SplitSavings = {
      mixAndMatchTotal,
      oneStopTotal: oneStopBest ? oneStopBest.total : null,
      oneStopComplete: oneStopBest !== null,
      storeCount: storesNeeded.size,
      storeNames: [...storesNeeded]
        .map((id) => result.find((r) => r.store.id === id)?.store.name)
        .filter((n): n is string => Boolean(n)),
      maxSavings,
      worthIt: maxSavings > 15 && storesNeeded.size <= 3, // rough heuristic: meaningful savings, not too many stops
      perItem: foundBest,
    };
    return { stores: result, splitSavings };
  });

export const getPriceHistory = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => z.object({ id: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    if (!Number.isSafeInteger(data.id)) return [];
    const sql = await getSql();
    // Full history (not just latest-per-store) so we can chart how each store's price
    // has moved over time — useful for spotting a genuine trend vs. a one-off cheap receipt.
    const rows = await sql<{ store_id: string; store_name: string; amount: string; observed_at: string }>`
      select p.store_id, s.name as store_name, p.amount::text as amount, p.observed_at::text as observed_at
      from prices p
      join stores s on s.id = p.store_id
      where p.product_id = ${data.id}
      order by p.observed_at asc
    `;
    return rows.map((r) => ({ ...r, amount: Number(r.amount) }));
  });

export const addPrice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { productId: number; storeId: string; amount: number }) =>
      z.object({
        productId: z.number().int().positive(),
        storeId: z.string().min(1),
        amount: z.number().positive().max(MAX_PRICE_XCG),
      }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      insert into prices (product_id, store_id, amount, source, user_id)
      values (${data.productId}, ${data.storeId}, ${data.amount}, 'manual', ${context.userId})
    `;
    return { ok: true as const };
  });

export const getList = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<ProductRow & { qty: string; list_id: number }>`
      select sl.id as list_id, sl.qty::text as qty, pr.id, pr.slug, pr.name, pr.brand, pr.category, pr.unit, pr.needs_review
      from shopping_list sl
      join products pr on pr.id = sl.product_id
      where sl.user_id = ${context.userId}
      order by pr.category, pr.name
    `;
  });

export const addToList = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: number }) =>
    z.object({ productId: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      insert into shopping_list (user_id, product_id, qty)
      values (${context.userId}, ${data.productId}, 1)
      on conflict (user_id, product_id) do update set qty = shopping_list.qty + 1
    `;
    return { ok: true as const };
  });

export const removeFromList = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: number }) =>
    z.object({ productId: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      delete from shopping_list where user_id = ${context.userId} and product_id = ${data.productId}
    `;
    return { ok: true as const };
  });
