import type { StoreScraper } from "./types";
import { goiscoScraper } from "./goisco";
import { mangusaScraper } from "./mangusa";
import { vanDenTweelScraper } from "./van-den-tweel";
import { vreugdenhilScraper } from "./vreugdenhil";
import { centrumScraper } from "./centrum";
import { carrefourScraper } from "./carrefour";

export const storeScrapers: StoreScraper[] = [
  goiscoScraper,
  mangusaScraper,
  vanDenTweelScraper,
  vreugdenhilScraper,
  centrumScraper,
  carrefourScraper,
];
