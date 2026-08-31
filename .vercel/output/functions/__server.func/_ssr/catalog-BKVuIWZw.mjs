import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-CTCjdals.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-BAAbVjyg.mjs";
import { hn as object, mn as number, vn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-BKVuIWZw.js
var listStores_createServerFn_handler = createServerRpc({
	id: "deceed0f07ccc1b044d768b50ef844d1adf2bd6d5aa316b0f0bd3c1ddd8bba3b",
	name: "listStores",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listStores.__executeServer(opts));
var listStores = createServerFn({ method: "GET" }).handler(listStores_createServerFn_handler, async () => {
	return (await getSql())`
    select id, name, area, address, hours, price_tier
    from stores
    order by
      case price_tier when 'budget' then 0 when 'mid' then 1 else 2 end,
      name
  `;
});
var listCategories_createServerFn_handler = createServerRpc({
	id: "599f6ef157822c87192cc0213fef3f49c7a84d058a3039012c70ae9f73b7e713",
	name: "listCategories",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listCategories.__executeServer(opts));
var listCategories = createServerFn({ method: "GET" }).handler(listCategories_createServerFn_handler, async () => {
	return (await getSql())`
    select category, count(*)::int as n from products group by category order by category
  `;
});
var searchProducts_createServerFn_handler = createServerRpc({
	id: "8b1419da44f8448d266be28c08f11704ae47857724eb379b521627274aa427f1",
	name: "searchProducts",
	filename: "src/lib/server/catalog.ts"
}, (opts) => searchProducts.__executeServer(opts));
var searchProducts = createServerFn({ method: "GET" }).validator((input) => input).handler(searchProducts_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const q = (data.q ?? "").trim().toLowerCase();
	const cat = (data.category ?? "").trim();
	const products = await sql`
      select id, slug, name, brand, category, unit
      from products
      where (${q.length === 0} or lower(name) like ${"%" + q + "%"} or lower(coalesce(brand,'')) like ${"%" + q + "%"})
        and (${cat.length === 0} or category = ${cat})
      order by name
    `;
	const latest = await sql`
      select distinct on (p.product_id, p.store_id)
        p.product_id, s.name as store_name, p.amount::text as amount
      from prices p
      join stores s on s.id = p.store_id
      order by p.product_id, p.store_id, p.observed_at desc
    `;
	const byProduct = /* @__PURE__ */ new Map();
	for (const row of latest) {
		const list = byProduct.get(row.product_id) ?? [];
		list.push({
			amount: Number(row.amount),
			store: row.store_name
		});
		byProduct.set(row.product_id, list);
	}
	return products.map((pr) => {
		const prices = (byProduct.get(pr.id) ?? []).sort((a, b) => a.amount - b.amount);
		return {
			...pr,
			min_price: prices[0] ? String(prices[0].amount) : null,
			max_price: prices.length ? String(prices[prices.length - 1].amount) : null,
			cheapest_store: prices[0]?.store ?? null
		};
	});
});
var getProduct_createServerFn_handler = createServerRpc({
	id: "156b687369b554bbe5eac173a37fb87e373f38706d45f3e72a364fbc9126b6f3",
	name: "getProduct",
	filename: "src/lib/server/catalog.ts"
}, (opts) => getProduct.__executeServer(opts));
var getProduct = createServerFn({ method: "GET" }).validator((input) => input).handler(getProduct_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const product = (await sql`
      select id, slug, name, brand, category, unit from products where id = ${data.id}
    `)[0] ?? null;
	const prices = await sql`
      select distinct on (p.store_id)
        p.product_id, p.store_id, s.name as store_name, p.amount::text as amount,
        p.observed_at::text as observed_at, p.source
      from prices p
      join stores s on s.id = p.store_id
      where p.product_id = ${data.id}
      order by p.store_id, p.observed_at desc
    `;
	prices.sort((a, b) => Number(a.amount) - Number(b.amount));
	return {
		product,
		prices
	};
});
var getStore_createServerFn_handler = createServerRpc({
	id: "6b7c672834ae4ab5932f0f557107456b4320357bcb0719a0d470ad8d1911315c",
	name: "getStore",
	filename: "src/lib/server/catalog.ts"
}, (opts) => getStore.__executeServer(opts));
var getStore = createServerFn({ method: "GET" }).validator((input) => input).handler(getStore_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const store = (await sql`
      select id, name, area, address, hours, price_tier from stores where id = ${data.id}
    `)[0] ?? null;
	const items = await sql`
      select distinct on (pr.id)
        pr.id, pr.slug, pr.name, pr.brand, pr.category, pr.unit,
        p.amount::text as amount, p.observed_at::text as observed_at
      from products pr
      join prices p on p.product_id = pr.id
      where p.store_id = ${data.id}
      order by pr.id, p.observed_at desc
    `;
	items.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
	return {
		store,
		items
	};
});
var cheapestBasket_createServerFn_handler = createServerRpc({
	id: "a05e5b42d453ba5651f14839c952690ca930fa27ec56475e6ea2670934c5d75b",
	name: "cheapestBasket",
	filename: "src/lib/server/catalog.ts"
}, (opts) => cheapestBasket.__executeServer(opts));
var cheapestBasket = createServerFn({ method: "GET" }).validator((input) => input).handler(cheapestBasket_createServerFn_handler, async ({ data }) => {
	const ids = data.productIds.filter((n) => Number.isFinite(n));
	if (ids.length === 0) return { stores: [] };
	const sql = await getSql();
	const stores = await sql`select id, name, area, address, hours, price_tier from stores`;
	const latest = await sql`
      select distinct on (p.product_id, p.store_id)
        p.product_id, p.store_id, p.amount::text as amount, pr.name
      from prices p
      join products pr on pr.id = p.product_id
      order by p.product_id, p.store_id, p.observed_at desc
    `;
	const idSet = new Set(ids);
	const byStore = /* @__PURE__ */ new Map();
	for (const row of latest) {
		if (!idSet.has(row.product_id)) continue;
		const list = byStore.get(row.store_id) ?? [];
		list.push({
			product_id: row.product_id,
			name: row.name,
			amount: Number(row.amount)
		});
		byStore.set(row.store_id, list);
	}
	const result = stores.map((store) => {
		const found = byStore.get(store.id) ?? [];
		const map = new Map(found.map((f) => [f.product_id, f]));
		const lines = ids.map((id) => {
			const f = map.get(id);
			return {
				product_id: id,
				name: f?.name ?? `#${id}`,
				amount: f ? f.amount : null
			};
		});
		const priced = lines.filter((l) => l.amount != null);
		return {
			store,
			total: priced.reduce((s, l) => s + l.amount, 0),
			missing: ids.length - priced.length,
			lines
		};
	});
	result.sort((a, b) => {
		if (a.missing !== b.missing) return a.missing - b.missing;
		return a.total - b.total;
	});
	return { stores: result };
});
var addPrice_createServerFn_handler = createServerRpc({
	id: "0e912a13afd7f5bcec7d983464eea48232cd38344ac56dd5e7cad2e8fe3168d1",
	name: "addPrice",
	filename: "src/lib/server/catalog.ts"
}, (opts) => addPrice.__executeServer(opts));
var addPrice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	productId: number().int().positive(),
	storeId: string().min(1),
	amount: number().positive().max(9999)
}).parse(input)).handler(addPrice_createServerFn_handler, async ({ data, context }) => {
	await (await getSql())`
      insert into prices (product_id, store_id, amount, source, user_id)
      values (${data.productId}, ${data.storeId}, ${data.amount}, 'manual', ${context.userId})
    `;
	return { ok: true };
});
var getList_createServerFn_handler = createServerRpc({
	id: "918a47f990b6fbe8efe89f47bddb036ae26a4ee4a81555b2c0607203fc3106b2",
	name: "getList",
	filename: "src/lib/server/catalog.ts"
}, (opts) => getList.__executeServer(opts));
var getList = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getList_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select sl.id as list_id, sl.qty::text as qty, pr.id, pr.slug, pr.name, pr.brand, pr.category, pr.unit
      from shopping_list sl
      join products pr on pr.id = sl.product_id
      where sl.user_id = ${context.userId}
      order by pr.category, pr.name
    `;
});
var addToList_createServerFn_handler = createServerRpc({
	id: "aea0a70e83d0377f8ea556c3cade13842ea1115dd680a3c96209d190e1f25c67",
	name: "addToList",
	filename: "src/lib/server/catalog.ts"
}, (opts) => addToList.__executeServer(opts));
var addToList = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(addToList_createServerFn_handler, async ({ data, context }) => {
	await (await getSql())`
      insert into shopping_list (user_id, product_id, qty)
      values (${context.userId}, ${data.productId}, 1)
      on conflict (user_id, product_id) do update set qty = shopping_list.qty + 1
    `;
	return { ok: true };
});
var removeFromList_createServerFn_handler = createServerRpc({
	id: "cc31e3bb79d73fe9c7536fe6186575f92fd6619d9afc9b6529f53f630928bbbf",
	name: "removeFromList",
	filename: "src/lib/server/catalog.ts"
}, (opts) => removeFromList.__executeServer(opts));
var removeFromList = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(removeFromList_createServerFn_handler, async ({ data, context }) => {
	await (await getSql())`
      delete from shopping_list where user_id = ${context.userId} and product_id = ${data.productId}
    `;
	return { ok: true };
});
//#endregion
export { addPrice_createServerFn_handler, addToList_createServerFn_handler, cheapestBasket_createServerFn_handler, getList_createServerFn_handler, getProduct_createServerFn_handler, getStore_createServerFn_handler, listCategories_createServerFn_handler, listStores_createServerFn_handler, removeFromList_createServerFn_handler, searchProducts_createServerFn_handler };
