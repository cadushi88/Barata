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

export const searchProducts = createServerFn({ method: "GET" })
  .validator((input: { q?: string; category?: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const q = (data.q ?? "").trim().toLowerCase();
    const cat = (data.category ?? "").trim();
    // Escape LIKE metacharacters so a shopper typing "100%" or "a_b" searches for those
    // literal characters instead of matching every product (and so a trailing backslash
    // can't make Postgres reject the pattern outright).
    const pattern = "%" + q.replace(/[\\%_]/g, (ch) => "\\" + ch) + "%";
    const products = await sql<ProductRow>`
      select id, slug, name, brand, category, unit, needs_review
      from products
      where (${q.length === 0} or lower(name) like ${pattern} escape '\\'
             or lower(coalesce(brand,'')) like ${pattern} escape '\\')
        and (${cat.length === 0} or category = ${cat})
      order by name
    `;
    const latest = await sql<{ product_id: number; store_name: string; amount: string }>`
      select distinct on (p.product_id, p.store_id)
        p.product_id, s.name as store_name, p.amount::text as amount
      from prices p
      join stores s on s.id = p.store_id
      order by p.product_id, p.store_id, p.observed_at desc
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
  .validator((input: { id: number }) => input)
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
      order by p.store_id, p.observed_at desc
    `;
    prices.sort((a, b) => Number(a.amount) - Number(b.amount));
    return { product, prices };
  });

export const getStore = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
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
      order by pr.id, p.observed_at desc
    `;
    items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return { store, items };
  });

export const cheapestBasket = createServerFn({ method: "GET" })
  .validator((input: { productIds: number[] }) => input)
  .handler(async ({ data }) => {
    const ids = data.productIds.filter((n) => Number.isFinite(n));
    if (ids.length === 0)
      return {
        stores: [] as {
          store: StoreRow;
          total: number;
          missing: number;
          lines: { product_id: number; name: string; amount: number | null }[];
        }[],
        splitSavings: null as {
          mixAndMatchTotal: number;
          storeCount: number;
          storeNames: string[];
          maxSavings: number;
          worthIt: boolean;
          oneStopComplete: boolean;
          perItem: { product_id: number; store: StoreRow; amount: number; name: string }[];
        } | null,
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
      order by p.product_id, p.store_id, p.observed_at desc
    `;
    const idSet = new Set(ids);
    const byStore = new Map<string, { product_id: number; name: string; amount: number }[]>();
    for (const row of latest) {
      if (!idSet.has(row.product_id)) continue;
      const list = byStore.get(row.store_id) ?? [];
      list.push({ product_id: row.product_id, name: row.name, amount: Number(row.amount) });
      byStore.set(row.store_id, list);
    }
    const result = stores.map((store) => {
      const found = byStore.get(store.id) ?? [];
      const map = new Map(found.map((f) => [f.product_id, f]));
      const lines = ids.map((id) => {
        const f = map.get(id);
        return { product_id: id, name: nameById.get(id) ?? f?.name ?? `#${id}`, amount: f ? f.amount : null };
      });
      const priced = lines.filter((l) => l.amount != null) as { product_id: number; name: string; amount: number }[];
      const total = priced.reduce((s, l) => s + l.amount, 0);
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
      let best: { store: StoreRow; amount: number; name: string } | null = null;
      for (const s of result) {
        const line = s.lines.find((l) => l.product_id === id);
        if (line?.amount != null && (!best || line.amount < best.amount)) {
          best = { store: s.store, amount: line.amount, name: line.name };
        }
      }
      return best ? { product_id: id, ...best } : null;
    });
    const foundBest = perItemBest.filter((b): b is NonNullable<typeof b> => b !== null);
    const mixAndMatchTotal = foundBest.reduce((s, b) => s + b.amount, 0);
    const storesNeeded = new Set(foundBest.map((b) => b.store.id));
    // The one-stop baseline is only comparable to the mix-and-match total when a single
    // store actually stocks the whole list — otherwise we would be pitting a 5-item bill
    // against a 6-item one and reporting the shortfall as a saving of zero. When no store
    // is complete, splitting isn't a choice, so say so instead of silently hiding the block.
    const oneStopBest = result.find((s) => s.missing === 0) ?? null;
    const maxSavings = oneStopBest ? Math.max(0, oneStopBest.total - mixAndMatchTotal) : 0;

    return {
      stores: result,
      splitSavings: {
        mixAndMatchTotal,
        storeCount: storesNeeded.size,
        storeNames: [...storesNeeded].map((id) => result.find((r) => r.store.id === id)?.store.name).filter(Boolean),
        maxSavings,
        worthIt: maxSavings > 15 && storesNeeded.size <= 3, // rough heuristic: meaningful savings, not too many stops
        oneStopComplete: oneStopBest !== null,
        perItem: foundBest,
      },
    };
  });

export const getPriceHistory = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => input)
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
        amount: z.number().positive().max(9999),
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
  .validator((input: { productId: number }) => input)
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
  .validator((input: { productId: number }) => input)
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    await sql`
      delete from shopping_list where user_id = ${context.userId} and product_id = ${data.productId}
    `;
    return { ok: true as const };
  });
