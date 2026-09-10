/**
 * Format an amount as XCG, or "—" when there is no amount to show.
 *
 * Missing is not zero: a product nobody has priced, or a store that stocks
 * nothing in the basket, must not read as "free". null/undefined and blank
 * strings render as "—", the same placeholder unparseable input already got.
 */
export function xcg(n: number | string | null | undefined): string {
  if (n === null || n === undefined) return "—";
  if (typeof n === "string" && n.trim() === "") return "—";
  const v = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(v)) return "—";
  return `XCG ${v.toFixed(2)}`;
}

export function num(n: number | string | null | undefined): number {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  return Number.isFinite(v) ? v : 0;
}
