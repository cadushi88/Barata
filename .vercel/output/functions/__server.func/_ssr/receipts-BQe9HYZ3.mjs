import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-CTCjdals.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-BAAbVjyg.mjs";
import { hn as object, ln as array, mn as number, vn as string } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/receipts-BQe9HYZ3.js
function normalize(s) {
	return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function scoreMatch(a, b) {
	const na = normalize(a);
	const nb = normalize(b);
	if (!na || !nb) return 0;
	if (na === nb) return 1;
	if (na.includes(nb) || nb.includes(na)) return .85;
	const aw = new Set(na.split(" "));
	const bw = nb.split(" ");
	let hit = 0;
	for (const w of bw) if (w.length > 2 && aw.has(w)) hit++;
	return hit / Math.max(bw.length, 1);
}
var parseReceipt_createServerFn_handler = createServerRpc({
	id: "2be73a9469685bd2c7e82b74e664a00c2274c79b07a593bc1918406e6eab3654",
	name: "parseReceipt",
	filename: "src/lib/server/receipts.ts"
}, (opts) => parseReceipt.__executeServer(opts));
var parseReceipt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	text: string().max(2e4),
	storeId: string().optional(),
	imageDataUrl: string().max(25e5).optional()
}).parse(input)).handler(parseReceipt_createServerFn_handler, async ({ data, context }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "AI is not available in this environment"
	};
	const sql = await getSql();
	const catalog = await sql`
      select id, name, category from products
    `;
	const userContent = [{
		type: "text",
		text: `Extract grocery receipt line items as JSON only.
Return {"storeGuess": string|null, "items":[{"name":string,"amount":number,"qty":number,"unit":string|null,"category":string}]}.
Amounts are in XCG (Caribbean guilder). Ignore totals, tax, change.
Prefer matching names to this catalog (id|name|category):\n${catalog.map((p) => `${p.id}|${p.name}|${p.category}`).join("\n")}\n
Receipt text:\n${data.text || "(image only)"}`
	}];
	if (data.imageDataUrl?.startsWith("data:image")) userContent.push({
		type: "image_url",
		image_url: { url: data.imageDataUrl }
	});
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 1200,
			temperature: 0,
			messages: [{
				role: "system",
				content: "You extract structured grocery receipt data. Reply with JSON only."
			}, {
				role: "user",
				content: userContent
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		error: `xAI API error ${res.status}`
	};
	const jsonMatch = ((await res.json()).choices?.[0]?.message?.content ?? "").match(/\{[\s\S]*\}/);
	if (!jsonMatch) return {
		ok: false,
		error: "Could not parse receipt"
	};
	let parsed;
	try {
		parsed = JSON.parse(jsonMatch[0]);
	} catch {
		return {
			ok: false,
			error: "Could not parse receipt JSON"
		};
	}
	const items = [];
	for (const it of parsed.items ?? []) {
		if (!it?.name || !Number.isFinite(Number(it.amount))) continue;
		let best = null;
		for (const p of catalog) {
			const s = scoreMatch(it.name, p.name);
			if (!best || s > best.score) best = {
				id: p.id,
				name: p.name,
				score: s
			};
		}
		const matched = best && best.score >= .45;
		items.push({
			name: String(it.name),
			amount: Number(it.amount),
			qty: Number(it.qty) || 1,
			unit: it.unit ?? null,
			category: it.category ?? (matched ? catalog.find((c) => c.id === best.id)?.category : "Pantry"),
			productId: matched ? best.id : null,
			matchedName: matched ? best.name : null
		});
	}
	items.sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || a.amount - b.amount);
	return {
		ok: true,
		receiptId: (await sql`
      insert into receipts (user_id, store_id, raw_text, parsed, status)
      values (
        ${context.userId},
        ${data.storeId || null},
        ${data.text || null},
        ${JSON.stringify({
			storeGuess: parsed.storeGuess ?? null,
			items
		})}::jsonb,
        'parsed'
      )
      returning id
    `)[0]?.id,
		storeGuess: parsed.storeGuess ?? null,
		items
	};
});
var commitReceipt_createServerFn_handler = createServerRpc({
	id: "445744bb073c8ec5a75173e5cfd695c69881e17bb7945022119858a810b61477",
	name: "commitReceipt",
	filename: "src/lib/server/receipts.ts"
}, (opts) => commitReceipt.__executeServer(opts));
var commitReceipt = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	receiptId: number().int(),
	storeId: string().min(1),
	items: array(object({
		productId: number().int(),
		amount: number().positive()
	}))
}).parse(input)).handler(commitReceipt_createServerFn_handler, async ({ data, context }) => {
	const sql = await getSql();
	if (!(await sql`
      select id from receipts where id = ${data.receiptId} and user_id = ${context.userId}
    `)[0]) return {
		ok: false,
		error: "Receipt not found"
	};
	for (const it of data.items) await sql`
        insert into prices (product_id, store_id, amount, source, user_id)
        values (${it.productId}, ${data.storeId}, ${it.amount}, 'receipt', ${context.userId})
      `;
	await sql`
      update receipts set store_id = ${data.storeId}, status = 'committed'
      where id = ${data.receiptId} and user_id = ${context.userId}
    `;
	return {
		ok: true,
		n: data.items.length
	};
});
var myReceipts_createServerFn_handler = createServerRpc({
	id: "5a83f0334b8d4ab2f155cbf5011d875d658363a65d2988c22a176ed7c4294a6a",
	name: "myReceipts",
	filename: "src/lib/server/receipts.ts"
}, (opts) => myReceipts.__executeServer(opts));
var myReceipts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(myReceipts_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select id, store_id, status, created_at::text as created_at
      from receipts
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
});
//#endregion
export { commitReceipt_createServerFn_handler, myReceipts_createServerFn_handler, parseReceipt_createServerFn_handler };
