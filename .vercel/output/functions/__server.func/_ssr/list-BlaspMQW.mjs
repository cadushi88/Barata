import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell, r as useCurrentUserState, t as RedirectToSignIn } from "./shell-CLM9xRhB.mjs";
import { a as getList, r as cheapestBasket, u as removeFromList } from "./catalog-Dn-8q4Un.mjs";
import { n as xcg, t as num } from "./money-Dn3tWgmK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/list-BlaspMQW.js
var import_jsx_runtime = require_jsx_runtime();
function ListPage() {
	const { user, isPending } = useCurrentUserState();
	const qc = useQueryClient();
	const list = useQuery({
		queryKey: ["list"],
		queryFn: () => getList(),
		enabled: !!user
	});
	const ids = (list.data ?? []).map((r) => r.id);
	const basket = useQuery({
		queryKey: ["basket", ids.join(",")],
		queryFn: () => cheapestBasket({ data: { productIds: ids } }),
		enabled: ids.length > 0
	});
	const rm = useMutation({
		mutationFn: (productId) => removeFromList({ data: { productId } }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["list"] });
		}
	});
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-2xl bg-line/60" }) });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const winner = basket.data?.stores[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold md:text-3xl",
			children: "Your list"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted md:text-base",
			children: "We total the same basket at every supermarket so you can pick one trip."
		}),
		(list.data ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-8 text-sm text-muted",
			children: [
				"Empty. Add items from the ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "catalog"
				}),
				"."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2",
				children: (list.data ?? []).map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/products/$id",
							params: { id: String(it.id) },
							className: "text-ink no-underline",
							children: it.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-faint",
							children: [
								it.category,
								" · qty ",
								num(it.qty)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "h-10 shrink-0 px-2 text-sm text-muted",
						onClick: () => rm.mutate(it.id),
						children: "Remove"
					})]
				}, it.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-10 font-display text-2xl",
				children: "Cheapest full basket"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid gap-3",
				children: (basket.data?.stores ?? []).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `rounded-2xl border p-4 ${i === 0 ? "border-primary bg-surface" : "border-line bg-surface"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/stores/$id",
							params: { id: s.store.id },
							className: "font-medium text-ink no-underline",
							children: s.store.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: s.store.area
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-medium tabular-nums",
									children: xcg(s.total)
								}),
								s.missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-warn",
									children: [s.missing, " items missing"]
								}) : null,
								i === 0 && winner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-good",
									children: "Best complete total"
								}) : null
							]
						})]
					})
				}, s.store.id))
			})
		] })
	] });
}
//#endregion
export { ListPage as component };
