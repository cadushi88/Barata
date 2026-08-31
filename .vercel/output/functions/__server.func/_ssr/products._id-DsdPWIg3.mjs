import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell, r as useCurrentUserState } from "./shell-CLM9xRhB.mjs";
import { l as listStores, n as addToList, o as getProduct, t as addPrice } from "./catalog-Dn-8q4Un.mjs";
import { n as xcg, t as num } from "./money-Dn3tWgmK.mjs";
import { r as Route$2 } from "./router-D0qKuP1C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products._id-DsdPWIg3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductPage() {
	const { id } = Route$2.useParams();
	const pid = Number(id);
	const { user } = useCurrentUserState();
	const qc = useQueryClient();
	const q = useQuery({
		queryKey: ["product", pid],
		queryFn: () => getProduct({ data: { id: pid } })
	});
	const stores = useQuery({
		queryKey: ["stores"],
		queryFn: () => listStores()
	});
	const [storeId, setStoreId] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const addL = useMutation({
		mutationFn: () => addToList({ data: { productId: pid } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["list"] })
	});
	const addP = useMutation({
		mutationFn: () => addPrice({ data: {
			productId: pid,
			storeId,
			amount: Number(amount)
		} }),
		onSuccess: () => {
			setAmount("");
			qc.invalidateQueries({ queryKey: ["product", pid] });
			qc.invalidateQueries({ queryKey: ["products"] });
		}
	});
	const product = q.data?.product;
	const prices = q.data?.prices ?? [];
	const min = prices.length ? Math.min(...prices.map((p) => num(p.amount))) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-line/60" }) : !product ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Product not found." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-xs text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-muted",
					children: "Catalog"
				}),
				" / ",
				product.category
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold md:text-3xl",
				children: product.name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [product.unit, product.brand ? ` · ${product.brand}` : ""]
			})] }), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => addL.mutate(),
				className: "h-11 w-full rounded-full bg-primary px-4 text-sm font-medium text-primary-fg sm:w-auto",
				children: "Add to list"
			}) : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-5 space-y-2 md:hidden",
			children: prices.map((p) => {
				const amt = num(p.amount);
				const delta = amt - min;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/stores/$id",
					params: { id: p.store_id },
					className: "flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-ink no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "truncate font-medium",
							children: p.store_name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-faint",
							children: String(p.observed_at).slice(0, 10)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "shrink-0 text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "tabular-nums font-medium",
							children: xcg(amt)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs",
							children: delta < .01 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-good",
								children: "Cheapest"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: ["+", xcg(delta)]
							})
						})]
					})]
				}, p.store_id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-bg text-left text-xs uppercase tracking-wide text-faint",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Store"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Price"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "vs cheapest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Updated"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: prices.map((p) => {
					const amt = num(p.amount);
					const delta = amt - min;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/stores/$id",
									params: { id: p.store_id },
									className: "text-ink no-underline hover:text-primary",
									children: p.store_name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-medium tabular-nums",
								children: xcg(amt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 tabular-nums text-muted",
								children: delta < .01 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-good",
									children: "Cheapest"
								}) : `+${xcg(delta)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-faint",
								children: String(p.observed_at).slice(0, 10)
							})
						]
					}, p.store_id);
				}) })]
			})
		}),
		user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex sm:flex-wrap sm:items-end",
			onSubmit: (e) => {
				e.preventDefault();
				if (storeId && Number(amount) > 0) addP.mutate();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm sm:flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-muted",
						children: "Store"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-11 w-full rounded-xl border border-line bg-bg px-3",
						value: storeId,
						onChange: (e) => setStoreId(e.target.value),
						required: true,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Choose…"
						}), (stores.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-muted",
						children: "Price (XCG)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-11 w-full rounded-xl border border-line bg-bg px-3 tabular-nums sm:w-28",
						inputMode: "decimal",
						value: amount,
						onChange: (e) => setAmount(e.target.value),
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "h-11 w-full rounded-xl bg-ink px-4 text-sm text-bg sm:w-auto",
					children: "Submit price"
				}),
				addP.isSuccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-good",
					children: "Saved"
				}) : null,
				addP.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-warn",
					children: "Could not save"
				}) : null
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-6 text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				children: "Sign in"
			}), " to report a price you just saw."]
		})
	] }) });
}
//#endregion
export { ProductPage as component };
