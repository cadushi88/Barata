import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { MAX_PRICE_XCG } from "@/lib/server/catalog";
import { z } from "zod";

/**
 * Most receipts one account may run through the (paid) AI extractor per hour.
 * Every call spends an xAI request on an attacker-chosen payload of up to 20k
 * characters plus a 2.5 MB image, so without a ceiling one signed-in account can
 * drain the app's API budget in a loop.
 */
const MAX_PARSES_PER_HOUR = 30;

/** Most price lines one receipt commit may publish. */
const MAX_COMMIT_ITEMS = 200;

type ParsedItem = {
  name: string;
  amount: number;
  qty?: number;
  unit?: string | null;
  category?: string;
  productId?: number | null;
  matchedName?: string | null;
  isWeighed?: boolean;
  /** Sold by weight but the receipt's per-kg figure was not readable — not publishable. */
  missingUnitPrice?: boolean;
  unitPrice?: number | null;
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreMatch(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const aw = new Set(na.split(" "));
  const bw = nb.split(" ");
  let hit = 0;
  for (const w of bw) if (w.length > 2 && aw.has(w)) hit++;
  return hit / Math.max(bw.length, 1);
}

/** Matches an AI-guessed store name (e.g. "Mangusa Hypermarket") against the known store catalog. */
function matchStore(
  guess: string | null | undefined,
  stores: { id: string; name: string }[],
): { storeId: string | null; confidence: number } {
  if (!guess) return { storeId: null, confidence: 0 };
  let best: { id: string; score: number } | null = null;
  for (const s of stores) {
    const score = scoreMatch(guess, s.name);
    if (!best || score > best.score) best = { id: s.id, score };
  }
  if (!best || best.score < 0.4) return { storeId: null, confidence: best?.score ?? 0 };
  return { storeId: best.id, confidence: Math.round(best.score * 100) / 100 };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Normalizes a date string (various receipt formats) to YYYY-MM-DD, rejecting future/implausible dates. */
export function normalizeReceiptDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  // A bare number ("2026", "0") is not a date anyone printed on a receipt, but
  // `new Date("2026")` happily yields 1 Jan 2026 — reject it rather than invent a day.
  if (!s || /^\d+$/.test(s)) return null;

  let y: number;
  let m: number;
  let d: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s);
  if (iso) {
    // Read ISO dates field-by-field: `new Date("2026-02-30")` parses as UTC and
    // rolls over to 2026-03-02, so an impossible printed date would be silently
    // stored as a real (wrong) one.
    y = Number(iso[1]);
    m = Number(iso[2]);
    d = Number(iso[3]);
  } else {
    const parsed = new Date(s);
    if (Number.isNaN(parsed.getTime())) return null;
    // Local calendar fields, not toISOString(): a locally-parsed "08/15/2026" is
    // local midnight, which in any timezone east of UTC would slip back a day.
    y = parsed.getFullYear();
    m = parsed.getMonth() + 1;
    d = parsed.getDate();
  }

  // Reject days that don't exist on the calendar (31 Sep, 30 Feb, month 13…).
  const asUtc = new Date(Date.UTC(y, m - 1, d));
  if (asUtc.getUTCFullYear() !== y || asUtc.getUTCMonth() !== m - 1 || asUtc.getUTCDate() !== d) return null;

  // Compare whole days, so a receipt bought earlier today is never "in the future",
  // and "ten years ago" really means ten years, not "1 Jan of ten calendar years back".
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const tenYearsAgo = Date.UTC(now.getFullYear() - 10, now.getMonth(), now.getDate());
  const t = asUtc.getTime();
  if (t > today || t < tenYearsAgo) return null;
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export const parseReceipt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { text: string; storeId?: string; imageDataUrl?: string }) =>
      z.object({
        text: z.string().max(20000),
        storeId: z.string().optional(),
        imageDataUrl: z.string().max(2_500_000).optional(),
      }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI is not available in this environment" };
    }
    const sql = await getSql();
    const [{ n: recentParses }] = await sql<{ n: number }>`
      select count(*)::int as n from receipts
      where user_id = ${context.userId} and created_at > now() - interval '1 hour'
    `;
    if (recentParses >= MAX_PARSES_PER_HOUR) {
      return { ok: false as const, error: "Too many receipts in the last hour — try again later" };
    }
    const catalog = await sql<{ id: number; name: string; category: string }>`
      select id, name, category from products
    `;
    const catalogHint = catalog.map((p) => `${p.id}|${p.name}|${p.category}`).join("\n");
    const storeRows = await sql<{ id: string; name: string }>`select id, name from stores`;
    const storeHint = storeRows.map((s) => s.name).join(", ");

    const userContent: unknown[] = [
      {
        type: "text",
        text: `Extract grocery receipt line items as JSON only.
Return {"storeGuess": string|null, "purchaseDate": string|null, "items":[{"name":string,"amount":number,"qty":number,"unit":string|null,"category":string,"isWeighed":boolean,"unitPrice":number|null}]}.
"storeGuess": the store/chain name printed on the receipt header/logo, if visible. Known Curaçao chains include: ${storeHint}. If the printed name closely matches one of these, use that exact name; otherwise return your best guess of the printed name as-is.
"purchaseDate": the transaction date printed on the receipt, converted to strict ISO format YYYY-MM-DD. If no date is visible, return null. Never invent a date.
"amount": the LINE TOTAL as printed (what was actually paid for that line).
"isWeighed": true for any item sold by weight, recognizable from patterns like "2.230 kg @ FL3.95/kg" or "1.860 kg @ FL8.95/kg" printed above or below the item name.
"unitPrice": for weighed items ONLY, the price PER KG (the "@ FLx.xx/kg" figure), NOT the line total — this is what makes two purchases of the same product at different weights actually comparable. For non-weighed items, set unitPrice to null.
Amounts are in XCG (Caribbean guilder; treat old "FL"/Antillean florin amounts as equivalent to XCG). Ignore totals, tax, change, and voided lines.
Prefer matching item names to this catalog (id|name|category):\n${catalogHint}\n
Receipt text:\n${data.text || "(image only)"}`,
      },
    ];
    if (data.imageDataUrl?.startsWith("data:image")) {
      userContent.push({
        type: "image_url",
        image_url: { url: data.imageDataUrl },
      });
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 1200,
        temperature: 0,
        messages: [
          {
            role: "system",
            content: "You extract structured grocery receipt data. Reply with JSON only.",
          },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `xAI API error ${res.status}` };
    }
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ok: false as const, error: "Could not parse receipt" };
    }
    let parsed: { storeGuess?: string | null; purchaseDate?: string | null; items?: ParsedItem[] };
    try {
      parsed = JSON.parse(jsonMatch[0]) as {
        storeGuess?: string | null;
        purchaseDate?: string | null;
        items?: ParsedItem[];
      };
    } catch {
      return { ok: false as const, error: "Could not parse receipt JSON" };
    }
    const { storeId: detectedStoreId, confidence: storeConfidence } = matchStore(parsed.storeGuess, storeRows);
    const purchaseDate = normalizeReceiptDate(parsed.purchaseDate);
    const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const isStale = purchaseDate ? Date.now() - new Date(purchaseDate).getTime() > ONE_YEAR_MS : false;

    const items: ParsedItem[] = [];
    for (const it of parsed.items ?? []) {
      if (!it?.name || !Number.isFinite(Number(it.amount))) continue;
      let best: { id: number; name: string; score: number } | null = null;
      for (const p of catalog) {
        const s = scoreMatch(it.name, p.name);
        if (!best || s > best.score) best = { id: p.id, name: p.name, score: s };
      }
      const matched = best && best.score >= 0.45;
      // For weighed goods (e.g. "2.23 kg @ FL3.95/kg"), the comparable, storable price is
      // the per-kg unit price — not the line total, which varies purely with how much was weighed.
      const declaredWeighed = Boolean(it.isWeighed);
      const perKg = Number(it.unitPrice);
      const isWeighed = declaredWeighed && Number.isFinite(perKg) && perKg > 0;
      // …which means a line flagged as weighed but missing its "@ x.xx/kg" figure has no
      // storable price at all. Previously it silently fell through to the line total, so
      // "2.230 kg @ 3.95/kg = 8.81" taught the catalog that a kilo costs 8.81. Keep the
      // line visible with its real total, but never let it be published as a price.
      const missingUnitPrice = declaredWeighed && !isWeighed;
      const recordedAmount = isWeighed ? perKg : Number(it.amount);
      // The model's output is derived from attacker-supplied receipt text/image, so treat
      // it as untrusted: an out-of-range amount is still shown (so the shopper sees what
      // was scanned) but never publishable. commitReceipt's validator also requires a
      // positive amount and validates the WHOLE batch, so a single zero/negative/oversized
      // line (a refund, a discount row, a misread "0.00") would otherwise reject every
      // price on the receipt — keep it visible, just not selectable for publish.
      const inRange = recordedAmount > 0 && recordedAmount <= MAX_PRICE_XCG;
      const publishable = matched && !missingUnitPrice && inRange;
      if (items.length >= MAX_COMMIT_ITEMS) break;
      items.push({
        name: String(it.name),
        amount: recordedAmount,
        qty: Number(it.qty) || 1,
        unit: isWeighed ? "kg" : it.unit ?? null,
        category: it.category ?? (matched ? catalog.find((c) => c.id === best!.id)?.category : "Pantry"),
        productId: publishable ? best!.id : null,
        matchedName: matched ? best!.name : null,
        isWeighed,
        missingUnitPrice,
        unitPrice: isWeighed ? recordedAmount : null,
      });
    }
    items.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.amount - b.amount);

    // Never write a client-supplied store id straight into the FK column — an
    // unknown id would surface as an unhandled 500 instead of a clean result.
    const requestedStoreId = storeRows.some((s) => s.id === data.storeId) ? data.storeId : null;

    const rec = await sql<{ id: number }>`
      insert into receipts (user_id, store_id, raw_text, parsed, status, purchase_date, detected_store_id, store_match_confidence)
      values (
        ${context.userId},
        ${requestedStoreId || detectedStoreId || null},
        ${data.text || null},
        ${JSON.stringify({ storeGuess: parsed.storeGuess ?? null, purchaseDate, items })}::jsonb,
        'parsed',
        ${purchaseDate},
        ${detectedStoreId},
        ${storeConfidence}
      )
      returning id
    `;
    return {
      ok: true as const,
      receiptId: rec[0]?.id,
      storeGuess: parsed.storeGuess ?? null,
      detectedStoreId,
      storeConfidence,
      purchaseDate,
      isStale,
      items,
    };
  });

export const commitReceipt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      receiptId: number;
      storeId: string;
      items: { productId: number; amount: number }[];
      purchaseDate?: string | null;
    }) =>
      z.object({
        receiptId: z.number().int().positive(),
        storeId: z.string().min(1).max(64),
        items: z
          .array(
            z.object({
              productId: z.number().int().positive(),
              amount: z.number().positive().max(MAX_PRICE_XCG),
            }),
          )
          .max(MAX_COMMIT_ITEMS),
        purchaseDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullish(),
      }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const owned = await sql<{ id: number; status: string; parsed: { items?: ParsedItem[] } | null }>`
      select id, status, parsed from receipts where id = ${data.receiptId} and user_id = ${context.userId}
    `;
    const receipt = owned[0];
    if (!receipt) return { ok: false as const, error: "Receipt not found" };
    // A receipt is a one-shot ticket to write public prices. Without this an
    // attacker could replay one commit endlessly to flood `prices`.
    if (receipt.status === "committed") {
      return { ok: false as const, error: "This receipt has already been published" };
    }
    const storeExists = await sql<{ id: string }>`select id from stores where id = ${data.storeId}`;
    if (!storeExists[0]) return { ok: false as const, error: "Unknown store" };

    // `prices` is PUBLIC data every other user's comparison depends on, so the
    // client only gets to SELECT which of this receipt's server-extracted lines
    // to publish — never to supply the product/price pair itself. Amounts come
    // from the row the server wrote at parse time, not from the request body.
    const rawParsedItems = receipt.parsed?.items;
    const parsedItems: ParsedItem[] = Array.isArray(rawParsedItems) ? rawParsedItems : [];
    const allowed = new Map<number, number>();
    for (const it of parsedItems) {
      const productId = Number(it?.productId);
      const amount = Number(it?.amount);
      if (!Number.isInteger(productId) || productId <= 0) continue;
      if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_PRICE_XCG) continue;
      allowed.set(productId, amount);
    }
    const lines: { productId: number; amount: number }[] = [];
    const seen = new Set<number>();
    for (const it of data.items) {
      const amount = allowed.get(it.productId);
      if (amount === undefined || seen.has(it.productId)) continue;
      seen.add(it.productId);
      lines.push({ productId: it.productId, amount });
    }
    if (lines.length === 0) {
      return { ok: false as const, error: "No matched receipt lines to publish" };
    }

    // The date input's `max` attribute is advisory only, and the purchase date drives
    // `observed_at` — every lookup takes the LATEST observation per store, so an
    // unchecked (or forged, future) date lets a price sit permanently at the top.
    // Re-validate on the server rather than trusting the client-side cap.
    const purchaseDate = normalizeReceiptDate(data.purchaseDate);
    if (data.purchaseDate && !purchaseDate) {
      return { ok: false as const, error: "Purchase date must be a real date within the last 10 years" };
    }
    // Use the receipt's actual purchase date for price history when we have one,
    // rather than the upload time — a receipt from last week shouldn't look like today's price.
    const observedAt = purchaseDate ? `${purchaseDate}T12:00:00Z` : new Date().toISOString();
    for (const it of lines) {
      await sql`
        insert into prices (product_id, store_id, amount, source, user_id, observed_at)
        values (${it.productId}, ${data.storeId}, ${it.amount}, 'receipt', ${context.userId}, ${observedAt})
      `;
    }
    await sql`
      update receipts set store_id = ${data.storeId}, status = 'committed', purchase_date = ${purchaseDate}
      where id = ${data.receiptId} and user_id = ${context.userId}
    `;
    return { ok: true as const, n: lines.length };
  });

export const myReceipts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; store_id: string | null; status: string; created_at: string }>`
      select id, store_id, status, created_at::text as created_at
      from receipts
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
  });
