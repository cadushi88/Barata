import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

/**
 * Everything Barata has stored under this account, as one JSON document —
 * the "export my data" self-service download described on `/privacy`.
 * Read-only; never used to prove or deny anything, just handed back to the
 * user who asked for it.
 */
export const exportMyData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    const [user] = await sql<{ email: string | null; name: string | null; created_at: string }>`
      select email, name, "createdAt"::text as created_at from "user" where id = ${userId}
    `;
    const list = await sql<{ product_name: string; qty: string }>`
      select pr.name as product_name, sl.qty::text as qty
      from shopping_list sl join products pr on pr.id = sl.product_id
      where sl.user_id = ${userId}
      order by pr.name
    `;
    const receipts = await sql<{ id: number; raw_text: string | null; status: string; created_at: string }>`
      select id, raw_text, status, created_at::text as created_at from receipts
      where user_id = ${userId} order by created_at desc
    `;
    const submittedPrices = await sql<{
      id: number;
      store_id: string;
      raw_name: string;
      raw_price: string;
      status: string;
      created_at: string;
    }>`
      select id, store_id, raw_name, raw_price::text as raw_price, status, created_at::text as created_at
      from scraped_prices where user_id = ${userId} order by created_at desc
    `;
    const messages = await sql<{ body: string; admin_reply: string | null; created_at: string }>`
      select body, admin_reply, created_at::text as created_at from messages
      where user_id = ${userId} order by created_at desc
    `;
    return {
      account: user ?? null,
      shoppingList: list,
      receipts,
      submittedPrices,
      messages,
      exportedAt: new Date().toISOString(),
    };
  });

/**
 * Permanently deletes the signed-in user's account and every row Barata
 * scoped to them. Order matters only for clarity, not FK correctness — app
 * tables use a plain `user_id text` with no foreign key to `"user"`, so
 * nothing here is enforced by cascade except the Better Auth session/account
 * rows, which cascade off `"user"` (see migrations/auth/0001_auth.sql).
 *
 * A submitted price that already went live (an approved `scraped_prices` row,
 * or a row in `prices`) is real crowd-sourced catalog data other users may be
 * relying on — deleted only while still pending (never published), otherwise
 * kept but stripped of the `user_id` link back to this account.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const userId = context.userId;
    await sql`delete from shopping_list where user_id = ${userId}`;
    await sql`delete from receipts where user_id = ${userId}`;
    await sql`delete from messages where user_id = ${userId}`;
    await sql`delete from scraped_prices where user_id = ${userId} and status = 'pending'`;
    await sql`update scraped_prices set user_id = null where user_id = ${userId}`;
    await sql`update prices set user_id = null where user_id = ${userId}`;
    await sql`delete from "user" where id = ${userId}`;
    return { ok: true as const };
  });
