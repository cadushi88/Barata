export function xcg(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  if (!Number.isFinite(v)) return "—";
  return `XCG ${v.toFixed(2)}`;
}

export function num(n: number | string | null | undefined): number {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  return Number.isFinite(v) ? v : 0;
}
