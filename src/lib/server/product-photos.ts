import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { adminMiddleware } from "@/lib/auth/admin-middleware";
import { z } from "zod";

/** Client-compressed to well under this before it ever reaches the wire — this is a hard backstop, not the normal path. */
const MAX_PHOTO_BYTES = 3_000_000;
const SUPPORTED = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseDataUrl(dataUrl: string): { contentType: string; bytes: Buffer } | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
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
    if (!parsed) return { ok: false as const, error: "Unsupported or oversized image" };
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

export const hasProductPhoto = createServerFn({ method: "GET" })
  .validator((input: { productId: number }) => z.object({ productId: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ product_id: number }>`
      select product_id from product_photos where product_id = ${data.productId}
    `;
    return { hasPhoto: rows.length > 0 };
  });
