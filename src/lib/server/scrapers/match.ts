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
export type ScoredMatch = { productId: number; confidence: number };

/**
 * Pre-normalized candidate list — build once per batch of matching (once per
 * scrape run, once per admin/prices page load), not once per item scored.
 * Every candidate's name goes through Unicode NFD normalization, which is
 * the expensive part of normalize() — re-running that per (item, candidate)
 * pair instead of per candidate turned a 453-candidate catalog into a real
 * bottleneck once closestCandidate started running per unmatched row on
 * every page load instead of per scraped item on a once-daily cron.
 */
export type MatchIndex = { id: number; normalized: string }[];

export function buildMatchIndex(candidates: MatchCandidate[]): MatchIndex {
  return candidates.map((c) => ({ id: c.id, normalized: normalize(c.name) })).filter((c) => c.normalized.length > 0);
}

/**
 * Raw similarity between two already-normalized names, with no confidence
 * floor — the single scoring rule shared by bestMatch (auto-match, applies
 * its own floor below) and closestCandidate (display-only hint, no floor),
 * so the two can never silently drift into different ideas of "similar."
 * Returns null only when there's no signal at all (no shared words).
 */
function scoreCandidate(target: string, candidate: string): number | null {
  if (candidate === target) return 1;
  if (candidate.includes(target) || target.includes(candidate)) {
    // Reward the substring covering most of the shorter string — "goya beans"
    // inside "goya red kidney beans" is a much weaker signal than "goya
    // bonchi kora" inside "goya bonchi kora 15.5 oz".
    const shorter = Math.min(candidate.length, target.length);
    const longer = Math.max(candidate.length, target.length);
    return 0.55 + 0.35 * (shorter / longer);
  }
  const targetWords = new Set(target.split(" ").filter((w) => w.length > 2));
  const candidateWords = new Set(candidate.split(" ").filter((w) => w.length > 2));
  const overlap = [...targetWords].filter((w) => candidateWords.has(w)).length;
  const union = new Set([...targetWords, ...candidateWords]).size;
  if (union === 0 || overlap === 0) return null;
  return 0.3 * (overlap / union);
}

/** Shared search loop behind bestMatch/closestCandidate — they differ only in the confidence floor. */
function findBest(scrapedName: string, index: MatchIndex, minConfidence: number): ScoredMatch | null {
  const target = normalize(scrapedName);
  if (!target) return null;

  let best: ScoredMatch | null = null;
  for (const c of index) {
    const confidence = scoreCandidate(target, c.normalized);
    if (confidence == null || confidence < minConfidence) continue;
    if (!best || confidence > best.confidence) best = { productId: c.id, confidence };
  }
  return best;
}

export function bestMatch(scrapedName: string, index: MatchIndex): ScoredMatch | null {
  return findBest(scrapedName, index, 0.15);
}

/**
 * Same scoring as bestMatch but with no minimum-confidence floor — for
 * showing a reviewer a "closest guess" hint on a row bestMatch left
 * unmatched (e.g. "Jacobos Yellow cheddar cheese 5lb" scoring too low
 * against the catalog's plain "Cheddar 500 g" to auto-match, but still
 * worth surfacing so a human isn't starting from zero). Never used to
 * auto-approve or auto-match — display only.
 */
export function closestCandidate(scrapedName: string, index: MatchIndex): ScoredMatch | null {
  return findBest(scrapedName, index, 0);
}
