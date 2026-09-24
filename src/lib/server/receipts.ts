import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";

/**
 * Most receipts one account may submit for manual review per hour. Doesn't spend
 * an API call, but each one is a row plus up to ~3 MB of photo bytes stored in
 * Postgres — still worth a ceiling against a submit-loop filling the review queue
 * (and the database) with junk.
 */
const MAX_SUBMISSIONS_PER_HOUR = 20;

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
type SupportedImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

/** Same cap `product_photos` uploads use — well under Vercel's serverless request body limit. */
const MAX_PHOTO_BYTES = 3_000_000;

/** Decodes a `data:<mime>;base64,...` URL into raw bytes, or null if it's not a supported image / too big. */
function parsePhotoDataUrl(dataUrl: string): { contentType: SupportedImageType; bytes: Buffer } | null {
  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) return null;
  const bytes = Buffer.from(parsed.data, "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_PHOTO_BYTES) return null;
  return { contentType: parsed.mediaType, bytes };
}

/** Splits a `data:image/...;base64,...` URL into the parts Claude's vision input needs. */
function parseImageDataUrl(dataUrl: string): { mediaType: SupportedImageType; data: string } | null {
  const m = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl);
  if (!m) return null;
  const mediaType = m[1].toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.has(mediaType)) return null;
  return { mediaType: mediaType as SupportedImageType, data: m[2] };
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

/**
 * Queues a receipt for manual (off-platform) review — no `ANTHROPIC_API_KEY`
 * involved at all. The photo (if any) is kept on the row until someone
 * transcribes it and lands the results as a migration into `scraped_prices`,
 * at which point `photo_data` gets cleared — see `/admin/receipts`.
 */
export const submitReceiptForReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { text?: string; storeId?: string; imageDataUrl?: string; purchaseDate?: string | null }) =>
      z
        .object({
          text: z.string().max(20000).optional(),
          storeId: z.string().optional(),
          imageDataUrl: z.string().max(4_200_000).optional(),
          purchaseDate: z.string().nullish(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    const text = data.text?.trim();
    if (!text && !data.imageDataUrl) {
      return { ok: false as const, error: "Add receipt text or a photo before submitting" };
    }
    const sql = await getSql();
    const [{ n: recentSubmissions }] = await sql<{ n: number }>`
      select count(*)::int as n from receipts
      where user_id = ${context.userId} and created_at > now() - interval '1 hour'
    `;
    if (recentSubmissions >= MAX_SUBMISSIONS_PER_HOUR) {
      return { ok: false as const, error: "Too many receipts in the last hour — try again later" };
    }
    let photo: { contentType: SupportedImageType; bytes: Buffer } | null = null;
    if (data.imageDataUrl) {
      photo = parsePhotoDataUrl(data.imageDataUrl);
      if (!photo) return { ok: false as const, error: "That photo couldn't be read — try a different one" };
    }
    const storeRows = await sql<{ id: string }>`select id from stores`;
    const requestedStoreId = storeRows.some((s) => s.id === data.storeId) ? data.storeId : null;
    const purchaseDate = normalizeReceiptDate(data.purchaseDate);
    if (data.purchaseDate && !purchaseDate) {
      return { ok: false as const, error: "Purchase date must be a real date within the last 10 years" };
    }
    const rec = await sql<{ id: number }>`
      insert into receipts (user_id, store_id, raw_text, status, purchase_date, photo_data, photo_content_type)
      values (
        ${context.userId}, ${requestedStoreId}, ${text || null}, 'awaiting_review', ${purchaseDate},
        ${photo?.bytes ?? null}, ${photo?.contentType ?? null}
      )
      returning id
    `;
    return { ok: true as const, receiptId: rec[0]?.id };
  });

export const myReceipts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; store_id: string | null; status: string; created_at: string; has_photo: boolean }>`
      select id, store_id, status, created_at::text as created_at, (photo_data is not null) as has_photo
      from receipts
      where user_id = ${context.userId}
      order by created_at desc
      limit 20
    `;
  });
