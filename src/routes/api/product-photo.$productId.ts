import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

/** Serves a real, admin-uploaded product photo straight from the DB. 404s (handled by ProductPhoto's onError fallback chain) when none has been uploaded yet. */
export const Route = createFileRoute("/api/product-photo/$productId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const productId = Number(params.productId);
        if (!Number.isSafeInteger(productId)) return new Response("Not found", { status: 404 });
        const sql = await getSql();
        const rows = await sql<{ data: Buffer; content_type: string }>`
          select data, content_type from product_photos where product_id = ${productId}
        `;
        const row = rows[0];
        if (!row) return new Response("Not found", { status: 404 });
        return new Response(new Uint8Array(row.data), {
          headers: {
            "content-type": row.content_type,
            // Admin re-uploads should show up promptly, not stick around for a year.
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
