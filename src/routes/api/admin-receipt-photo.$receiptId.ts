import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

/**
 * Serves an uploaded receipt photo straight from the DB — admin-only, unlike
 * `/api/product-photo`, since a receipt photo can show a shopper's other purchases
 * and is submitted by a specific user, not curated marketing content.
 */
export const Route = createFileRoute("/api/admin-receipt-photo/$receiptId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const receiptId = Number(params.receiptId);
        if (!Number.isSafeInteger(receiptId)) return new Response("Not found", { status: 404 });
        const { requireAdmin } = await import("@/lib/auth/admin.server");
        try {
          await requireAdmin();
        } catch (err) {
          const status = err instanceof Error && "status" in err ? Number(err.status) : 500;
          return new Response("Forbidden", { status: status || 500 });
        }
        const sql = await getSql();
        const rows = await sql<{ photo_data: Buffer | null; photo_content_type: string | null }>`
          select photo_data, photo_content_type from receipts where id = ${receiptId}
        `;
        const row = rows[0];
        if (!row?.photo_data || !row.photo_content_type) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(row.photo_data), {
          headers: { "content-type": row.photo_content_type, "cache-control": "private, max-age=300" },
        });
      },
    },
  },
});
