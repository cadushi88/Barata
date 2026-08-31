import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Shell } from "./shell-CLM9xRhB.mjs";
import { l as listStores } from "./catalog-Dn-8q4Un.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stores-DRJnnFBq.js
var import_jsx_runtime = require_jsx_runtime();
function StoresPage() {
	const q = useQuery({
		queryKey: ["stores"],
		queryFn: () => listStores()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold md:text-3xl",
			children: "Supermarkets"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted md:text-base",
			children: "Coverage starts with the chains Fundashon pa Konsumidó surveyed in 2026, plus Goisco. Budget stores tend to win on staples; premium stores win on Dutch imports."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
			children: (q.data ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/stores/$id",
				params: { id: s.id },
				className: "rounded-2xl border border-line bg-surface p-4 text-ink no-underline hover:border-primary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: s.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted",
						children: s.area
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-bg px-2 py-0.5 text-xs capitalize text-muted",
						children: s.price_tier
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-faint",
					children: s.hours
				})]
			}, s.id))
		})
	] });
}
//#endregion
export { StoresPage as component };
