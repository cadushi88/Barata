import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BAAbVjyg.mjs";
import { hn as object, ln as array, mn as number, vn as string } from "../_libs/@better-auth/core+[...].mjs";
import { n as Shell, r as useCurrentUserState, t as RedirectToSignIn } from "./shell-CLM9xRhB.mjs";
import { d as searchProducts, i as createSsrRpc, l as listStores } from "./catalog-Dn-8q4Un.mjs";
import { n as xcg } from "./money-Dn3tWgmK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contribute-B9FbS2pT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var parseReceipt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	text: string().max(2e4),
	storeId: string().optional(),
	imageDataUrl: string().max(25e5).optional()
}).parse(input)).handler(createSsrRpc("2be73a9469685bd2c7e82b74e664a00c2274c79b07a593bc1918406e6eab3654"));
var commitReceipt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	receiptId: number().int(),
	storeId: string().min(1),
	items: array(object({
		productId: number().int(),
		amount: number().positive()
	}))
}).parse(input)).handler(createSsrRpc("445744bb073c8ec5a75173e5cfd695c69881e17bb7945022119858a810b61477"));
createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5a83f0334b8d4ab2f155cbf5011d875d658363a65d2988c22a176ed7c4294a6a"));
function ContributePage() {
	const { user, isPending } = useCurrentUserState();
	const stores = useQuery({
		queryKey: ["stores"],
		queryFn: () => listStores()
	});
	const catalog = useQuery({
		queryKey: [
			"products",
			"",
			""
		],
		queryFn: () => searchProducts({ data: {
			q: "",
			category: ""
		} })
	});
	const [text, setText] = (0, import_react.useState)("Mangusa Hypermarket\nMelk 1L          3.15\nRijst 1kg        5.49\nKipfilet 1kg    11.20\nBananen 1kg      4.80\nEieren 12        6.25\nTOTAAL          30.89");
	const [storeId, setStoreId] = (0, import_react.useState)("mangusa-hyper");
	const [imageDataUrl, setImageDataUrl] = (0, import_react.useState)();
	const parse = useMutation({ mutationFn: () => parseReceipt({ data: {
		text,
		storeId,
		imageDataUrl
	} }) });
	const commit = useMutation({ mutationFn: () => {
		const items = (parse.data && parse.data.ok ? parse.data.items : []).filter((i) => i.productId).map((i) => ({
			productId: i.productId,
			amount: i.amount
		}));
		return commitReceipt({ data: {
			receiptId: (parse.data && parse.data.ok ? parse.data.receiptId : 0) ?? 0,
			storeId,
			items
		} });
	} });
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-2xl bg-line/60" }) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const parsed = parse.data && parse.data.ok ? parse.data : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold md:text-3xl",
			children: "Update prices"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted md:text-base",
			children: "Paste a receipt or type the lines. Grok reads the items, sorts them by category and price, and matches them to the catalog."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-3",
				onSubmit: (e) => {
					e.preventDefault();
					parse.mutate();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-muted",
							children: "Store"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-11 w-full rounded-xl border border-line bg-surface px-3",
							value: storeId,
							onChange: (e) => setStoreId(e.target.value),
							children: (stores.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s.id,
								children: s.name
							}, s.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-muted",
							children: "Receipt text"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "min-h-48 w-full rounded-2xl border border-line bg-surface p-3 font-mono text-sm",
							value: text,
							onChange: (e) => setText(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm text-muted",
						children: ["Optional photo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							className: "mt-1 block w-full text-sm",
							onChange: (e) => {
								const f = e.target.files?.[0];
								if (!f) {
									setImageDataUrl(void 0);
									return;
								}
								const reader = new FileReader();
								reader.onload = () => setImageDataUrl(String(reader.result));
								reader.readAsDataURL(f);
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: parse.isPending,
						className: "h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60",
						children: parse.isPending ? "Reading receipt…" : "Read with AI"
					}),
					parse.data && !parse.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-warn",
						children: parse.data.error
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium",
					children: "Sorted items"
				}), !parsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Results appear here, grouped by type."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: parsed.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: it.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-faint",
								children: [it.category, it.matchedName ? ` · matched ${it.matchedName}` : " · unmatched"]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "tabular-nums",
								children: xcg(it.amount)
							})]
						}, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 h-11 rounded-xl bg-ink px-4 text-sm text-bg disabled:opacity-50",
						disabled: commit.isPending || !parsed.items.some((i) => i.productId),
						onClick: () => commit.mutate(),
						children: commit.isPending ? "Saving…" : "Publish matched prices"
					}),
					commit.data && commit.data.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-good",
						children: [
							"Published ",
							commit.data.n,
							" prices to the public catalog."
						]
					}) : null
				] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-xs text-faint",
			children: [
				"Catalog size: ",
				(catalog.data ?? []).length,
				" products. Unmatched lines stay private until a human maps them."
			]
		})
	] });
}
//#endregion
export { ContributePage as component };
