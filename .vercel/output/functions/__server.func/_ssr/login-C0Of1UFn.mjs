import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-DN46FajS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C0Of1UFn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const [mode, setMode] = (0, import_react.useState)("in");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onEmail(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			if (mode === "up") {
				const r = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0]
				});
				if (r.error) throw new Error(r.error.message || "Sign up failed");
			} else {
				const r = await authClient.signIn.email({
					email,
					password
				});
				if (r.error) throw new Error(r.error.message || "Sign in failed");
			}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-bg px-4 py-10 pb-8 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm space-y-5 rounded-[28px] border border-line bg-surface p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "font-display text-2xl font-semibold text-ink no-underline",
				children: "Barata"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Save your list and contribute live prices."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						className: "w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm font-medium hover:bg-line/40",
						children: ["Continue with ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 text-xs text-faint",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" }),
						"or email",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-line" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: onEmail,
					className: "space-y-3",
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm",
							placeholder: "Name",
							value: name,
							onChange: (e) => setName(e.target.value)
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm",
							type: "email",
							required: true,
							placeholder: "Email",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm",
							type: "password",
							required: true,
							minLength: 8,
							placeholder: "Password (8+ characters)",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-warn",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "h-11 w-full rounded-xl bg-primary text-sm font-medium text-primary-fg disabled:opacity-60",
							children: busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "w-full text-sm text-muted",
					onClick: () => setMode(mode === "up" ? "in" : "up"),
					children: mode === "up" ? "Already have an account? Sign in" : "New here? Create an account"
				})
			] })]
		})
	});
}
//#endregion
export { Login as component };
