import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";

type ParsedItem = {
  name: string;
  amount: number;
  qty?: number;
  unit?: string | null;
  category?: string;
  productId?: number | null;
  matchedName?: string | null;
  isWeighed?: boolean;
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

/** Normalizes a date string (various receipt formats) to YYYY-MM-DD, rejecting future/implausible dates. */
function normalizeReceiptDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
  if (d > now || d < tenYearsAgo) return null;
  return d.toISOString().slice(0, 10);
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
      const isWeighed = Boolean(it.isWeighed) && Number.isFinite(Number(it.unitPrice)) && Number(it.unitPrice) > 0;
      const recordedAmount = isWeighed ? Number(it.unitPrice) : Number(it.amount);
      items.push({
        name: String(it.name),
        amount: recordedAmount,
        qty: Number(it.qty) || 1,
        unit: isWeighed ? "kg" : it.unit ?? null,
        category: it.category ?? (matched ? catalog.find((c) => c.id === best!.id)?.category : "Pantry"),
        productId: matched ? best!.id : null,
        matchedName: matched ? best!.name : null,
        isWeighed,
        unitPrice: isWeighed ? recordedAmount : null,
      });
    }
    items.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.amount - b.amount);

    const rec = await sql<{ id: number }>`
      insert into receipts (user_id, store_id, raw_text, parsed, status, purchase_date, detected_store_id, store_match_confidence)
      values (
        ${context.userId},
        ${data.storeId || detectedStoreId || null},
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
        receiptId: z.number().int(),
        storeId: z.string().min(1),
        items: z.array(z.object({ productId: z.number().int(), amount: z.number().positive() })),
        purchaseDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullish(),
      }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const owned = await sql<{ id: number }>`
      select id from receipts where id = ${data.receiptId} and user_id = ${context.userId}
    `;
    if (!owned[0]) return { ok: false as const, error: "Receipt not found" };
    // Use the receipt's actual purchase date for price history when we have one,
    // rather than the upload time — a receipt from last week shouldn't look like today's price.
    const observedAt = data.purchaseDate ? `${data.purchaseDate}T12:00:00Z` : new Date().toISOString();
    for (const it of data.items) {
      await sql`
        insert into prices (product_id, store_id, amount, source, user_id, observed_at)
        values (${it.productId}, ${data.storeId}, ${it.amount}, 'receipt', ${context.userId}, ${observedAt})
      `;
    }
    await sql`
      update receipts set store_id = ${data.storeId}, status = 'committed', purchase_date = ${data.purchaseDate ?? null}
      where id = ${data.receiptId} and user_id = ${context.userId}
    `;
    return { ok: true as const, n: data.items.length };
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
