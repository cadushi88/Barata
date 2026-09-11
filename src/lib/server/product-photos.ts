import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { adminMiddleware } from "@/lib/auth/admin-middleware";
import { z } from "zod";

/**
 * Client-compressed images are well under this; PDFs travel uncompressed, so this
 * caps them too. Deliberately kept well under Vercel's ~4.5 MB serverless request
 * body limit even after base64 inflates it ~1.37x — a bigger cap here would let a
 * request get silently rejected by the platform before ever reaching this code,
 * which is indistinguishable from "upload does nothing" to whoever hit it.
 */
const MAX_PHOTO_BYTES = 3_000_000;
const SUPPORTED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

function parseDataUrl(dataUrl: string): { contentType: string; bytes: Buffer } | null {
  const m = /^data:([a-zA-Z0-9.+-]+\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const contentType = m[1].toLowerCase();
  if (!SUPPORTED.has(contentType)) return null;
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PHOTO_BYTES) return null;
  return { contentType, bytes };
}

export const uploadProductPhoto = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { productId: number; dataUrl: string }) =>
    z
      .object({
        productId: z.number().int().positive(),
        dataUrl: z.string().max(4_200_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const parsed = parseDataUrl(data.dataUrl);
    if (!parsed) return { ok: false as const, error: "Unsupported or oversized file" };
    const sql = await getSql();
    const product = await sql<{ id: number }>`select id from products where id = ${data.productId}`;
    if (!product[0]) return { ok: false as const, error: "Product not found" };
    await sql`
      insert into product_photos (product_id, data, content_type, uploaded_by)
      values (${data.productId}, ${parsed.bytes}, ${parsed.contentType}, ${context.userId})
      on conflict (product_id) do update set
        data = excluded.data, content_type = excluded.content_type,
        uploaded_by = excluded.uploaded_by, uploaded_at = now()
    `;
    return { ok: true as const };
  });

export const getProductPhotoMeta = createServerFn({ method: "GET" })
  .validator((input: { productId: number }) => z.object({ productId: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ content_type: string }>`
      select content_type from product_photos where product_id = ${data.productId}
    `;
    return { contentType: rows[0]?.content_type ?? null };
  });
