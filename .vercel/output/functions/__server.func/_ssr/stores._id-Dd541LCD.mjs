import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell } from "./shell-CLM9xRhB.mjs";
import { s as getStore } from "./catalog-Dn-8q4Un.mjs";
import { n as xcg } from "./money-Dn3tWgmK.mjs";
import { n as Route$1 } from "./router-D0qKuP1C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stores._id-Dd541LCD.js
var import_jsx_runtime = require_jsx_runtime();
function StorePage() {
	const { id } = Route$1.useParams();
	const q = useQuery({
		queryKey: ["store", id],
		queryFn: () => getStore({ data: { id } })
	});
	const store = q.data?.store;
	const items = q.data?.items ?? [];
	let lastCat = "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-2xl bg-line/60" }) : !store ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Store not found." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/stores",
				children: "Stores"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-1 font-display text-2xl font-semibold md:text-3xl",
			children: store.name
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				store.area,
				" · ",
				store.address
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-faint",
			children: store.hours
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-2",
			children: items.map((it) => {
				const show = it.category !== lastCat;
				lastCat = it.category;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-faint",
					children: it.category
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/products/$id",
					params: { id: String(it.id) },
					className: "flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-ink no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate",
							children: it.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-faint",
							children: it.unit
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 tabular-nums font-medium",
						children: xcg(it.amount)
					})]
				})] }, it.id);
			})
		})
	] }) });
}
//#endregion
export { StorePage as component };
