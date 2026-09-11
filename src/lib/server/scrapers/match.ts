/**
 * Best-effort match of a scraped item name against the existing catalog, so
 * the review page can show "looks like an existing price update" vs. "looks
 * like a new product" without a reviewer having to search by hand. Nothing
 * here writes data — it only scores candidates for `scraped_prices`.
 */

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents so "korá" ~ "kora"
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type MatchCandidate = { id: number; name: string };

export function bestMatch(
  scrapedName: string,
  candidates: MatchCandidate[],
): { productId: number; confidence: number } | null {
  const target = normalize(scrapedName);
  if (!target) return null;

  let best: { productId: number; confidence: number } | null = null;
  for (const c of candidates) {
    const candidate = normalize(c.name);
    if (!candidate) continue;
    let confidence: number;
    if (candidate === target) {
      confidence = 1;
    } else if (candidate.includes(target) || target.includes(candidate)) {
      // Reward the substring covering most of the shorter string — "goya beans"
      // inside "goya red kidney beans" is a much weaker signal than "goya
      // bonchi kora" inside "goya bonchi kora 15.5 oz".
      const shorter = Math.min(candidate.length, target.length);
      const longer = Math.max(candidate.length, target.length);
      confidence = 0.55 + 0.35 * (shorter / longer);
    } else {
      const targetWords = new Set(target.split(" ").filter((w) => w.length > 2));
      const candidateWords = new Set(candidate.split(" ").filter((w) => w.length > 2));
      const overlap = [...targetWords].filter((w) => candidateWords.has(w)).length;
      const union = new Set([...targetWords, ...candidateWords]).size;
      if (union === 0 || overlap === 0) continue;
      confidence = 0.3 * (overlap / union);
      if (confidence < 0.15) continue;
    }
    if (!best || confidence > best.confidence) best = { productId: c.id, confidence };
  }
  return best;
}
