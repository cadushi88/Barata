import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell, r as useCurrentUserState } from "./shell-CLM9xRhB.mjs";
import { c as listCategories, d as searchProducts, n as addToList } from "./catalog-Dn-8q4Un.mjs";
import { n as xcg, t as num } from "./money-Dn3tWgmK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CsdXduNx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [q, setQ] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("");
	const { user } = useCurrentUserState();
	const qc = useQueryClient();
	const cats = useQuery({
		queryKey: ["cats"],
		queryFn: () => listCategories()
	});
	const products = useQuery({
		queryKey: [
			"products",
			q,
			category
		],
		queryFn: () => searchProducts({ data: {
			q,
			category
		} })
	});
	const add = useMutation({
		mutationFn: (productId) => addToList({ data: { productId } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["list"] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-5 max-w-2xl md:mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-primary",
					children: "Curaçao · 12 stores · 80 staples"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl",
					children: "Who is cheapest today?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 hidden text-base text-muted sm:block",
					children: "Compare grocery prices across Mangusa, Centrum, Van den Tweel, Carrefour, Goisco and more. Add a receipt and the catalog updates for everyone."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sticky top-14 z-10 -mx-4 mb-3 bg-bg/95 px-4 py-2 backdrop-blur-sm md:static md:mx-0 md:mb-4 md:bg-transparent md:px-0 md:py-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search milk, rice, chicken…",
				className: "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base outline-none ring-primary/30 focus:ring-2"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mb-6 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setCategory(""),
				className: `h-10 shrink-0 rounded-full px-4 text-sm ${category === "" ? "bg-ink text-bg" : "border border-line bg-surface text-muted"}`,
				children: "All"
			}), (cats.data ?? []).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setCategory(c.category),
				className: `h-10 shrink-0 rounded-full px-4 text-sm ${category === c.category ? "bg-ink text-bg" : "border border-line bg-surface text-muted"}`,
				children: c.category
			}, c.category))]
		}),
		products.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-warn",
			children: "Could not load the catalog. Refresh in a moment."
		}) : products.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-2xl bg-line/60" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: (products.data ?? []).map((p) => {
				const min = num(p.min_price);
				const max = num(p.max_price);
				const save = max > min ? max - min : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-2xl border border-line bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/products/$id",
									params: { id: String(p.id) },
									className: "font-medium text-ink no-underline hover:text-primary",
									children: p.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-faint",
									children: [
										p.category,
										p.brand ? ` · ${p.brand}` : "",
										" · ",
										p.unit
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "shrink-0 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium tabular-nums",
									children: xcg(min)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "max-w-28 truncate text-xs text-muted",
									children: p.cheapest_store
								})]
							})]
						}),
						save > .2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-good",
							children: [
								"Spread ",
								xcg(save),
								" vs the dearest store"
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/products/$id",
								params: { id: String(p.id) },
								className: "inline-flex h-10 items-center rounded-lg border border-line px-3 text-sm text-ink no-underline",
								children: "Compare"
							}), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "inline-flex h-10 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg",
								onClick: () => add.mutate(p.id),
								children: "Add to list"
							}) : null]
						})
					]
				}, p.id);
			})
		})
	] });
}
//#endregion
export { Home as component };
