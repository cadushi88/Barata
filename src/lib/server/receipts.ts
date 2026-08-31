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

    const userContent: unknown[] = [
      {
        type: "text",
        text: `Extract grocery receipt line items as JSON only.
Return {"storeGuess": string|null, "items":[{"name":string,"amount":number,"qty":number,"unit":string|null,"category":string}]}.
Amounts are in XCG (Caribbean guilder). Ignore totals, tax, change.
Prefer matching names to this catalog (id|name|category):\n${catalogHint}\n
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
    let parsed: { storeGuess?: string | null; items?: ParsedItem[] };
    try {
      parsed = JSON.parse(jsonMatch[0]) as { storeGuess?: string | null; items?: ParsedItem[] };
    } catch {
      return { ok: false as const, error: "Could not parse receipt JSON" };
    }
    const items: ParsedItem[] = [];
    for (const it of parsed.items ?? []) {
      if (!it?.name || !Number.isFinite(Number(it.amount))) continue;
      let best: { id: number; name: string; score: number } | null = null;
      for (const p of catalog) {
        const s = scoreMatch(it.name, p.name);
        if (!best || s > best.score) best = { id: p.id, name: p.name, score: s };
      }
      const matched = best && best.score >= 0.45;
      items.push({
        name: String(it.name),
        amount: Number(it.amount),
        qty: Number(it.qty) || 1,
        unit: it.unit ?? null,
        category: it.category ?? (matched ? catalog.find((c) => c.id === best!.id)?.category : "Pantry"),
        productId: matched ? best!.id : null,
        matchedName: matched ? best!.name : null,
      });
    }
    items.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.amount - b.amount);

    const rec = await sql<{ id: number }>`
      insert into receipts (user_id, store_id, raw_text, parsed, status)
      values (
        ${context.userId},
        ${data.storeId || null},
        ${data.text || null},
        ${JSON.stringify({ storeGuess: parsed.storeGuess ?? null, items })}::jsonb,
        'parsed'
      )
      returning id
    `;
    return { ok: true as const, receiptId: rec[0]?.id, storeGuess: parsed.storeGuess ?? null, items };
  });

export const commitReceipt = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { receiptId: number; storeId: string; items: { productId: number; amount: number }[] }) =>
      z.object({
        receiptId: z.number().int(),
        storeId: z.string().min(1),
        items: z.array(z.object({ productId: z.number().int(), amount: z.number().positive() })),
      }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const owned = await sql<{ id: number }>`
      select id from receipts where id = ${data.receiptId} and user_id = ${context.userId}
    `;
    if (!owned[0]) return { ok: false as const, error: "Receipt not found" };
    for (const it of data.items) {
      await sql`
        insert into prices (product_id, store_id, amount, source, user_id)
        values (${it.productId}, ${data.storeId}, ${it.amount}, 'receipt', ${context.userId})
      `;
    }
    await sql`
      update receipts set store_id = ${data.storeId}, status = 'committed'
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
