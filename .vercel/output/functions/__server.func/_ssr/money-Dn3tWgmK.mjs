//#region node_modules/.nitro/vite/services/ssr/assets/money-Dn3tWgmK.js
function xcg(n) {
	const v = typeof n === "string" ? Number(n) : n ?? 0;
	if (!Number.isFinite(v)) return "—";
	return `XCG ${v.toFixed(2)}`;
}
function num(n) {
	const v = typeof n === "string" ? Number(n) : n ?? 0;
	return Number.isFinite(v) ? v : 0;
}
//#endregion
export { xcg as n, num as t };
