import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BAAbVjyg.mjs";
import { hn as object, mn as number, vn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-Dn-8q4Un.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listStores = createServerFn({ method: "GET" }).handler(createSsrRpc("deceed0f07ccc1b044d768b50ef844d1adf2bd6d5aa316b0f0bd3c1ddd8bba3b"));
var listCategories = createServerFn({ method: "GET" }).handler(createSsrRpc("599f6ef157822c87192cc0213fef3f49c7a84d058a3039012c70ae9f73b7e713"));
var searchProducts = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("8b1419da44f8448d266be28c08f11704ae47857724eb379b521627274aa427f1"));
var getProduct = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("156b687369b554bbe5eac173a37fb87e373f38706d45f3e72a364fbc9126b6f3"));
var getStore = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("6b7c672834ae4ab5932f0f557107456b4320357bcb0719a0d470ad8d1911315c"));
var cheapestBasket = createServerFn({ method: "GET" }).validator((input) => input).handler(createSsrRpc("a05e5b42d453ba5651f14839c952690ca930fa27ec56475e6ea2670934c5d75b"));
var addPrice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	productId: number().int().positive(),
	storeId: string().min(1),
	amount: number().positive().max(9999)
}).parse(input)).handler(createSsrRpc("0e912a13afd7f5bcec7d983464eea48232cd38344ac56dd5e7cad2e8fe3168d1"));
var getList = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("918a47f990b6fbe8efe89f47bddb036ae26a4ee4a81555b2c0607203fc3106b2"));
var addToList = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("aea0a70e83d0377f8ea556c3cade13842ea1115dd680a3c96209d190e1f25c67"));
var removeFromList = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("cc31e3bb79d73fe9c7536fe6186575f92fd6619d9afc9b6529f53f630928bbbf"));
//#endregion
export { getList as a, listCategories as c, searchProducts as d, createSsrRpc as i, listStores as l, addToList as n, getProduct as o, cheapestBasket as r, getStore as s, addPrice as t, removeFromList as u };
