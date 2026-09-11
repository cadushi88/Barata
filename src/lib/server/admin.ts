import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { adminMiddleware } from "@/lib/auth/admin-middleware";

export type AdminOverview = {
  pendingPrices: number;
  openMessages: number;
  totalReceipts: number;
  pendingReceipts: number;
  totalUsers: number;
};

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async (): Promise<AdminOverview> => {
    const sql = await getSql();
    const [{ n: pendingPrices }] = await sql<{ n: number }>`
      select count(*)::int as n from scraped_prices where status = 'pending'
    `;
    const [{ n: openMessages }] = await sql<{ n: number }>`
      select count(*)::int as n from messages where status = 'open'
    `;
    const [{ n: totalReceipts }] = await sql<{ n: number }>`select count(*)::int as n from receipts`;
    const [{ n: pendingReceipts }] = await sql<{ n: number }>`
      select count(*)::int as n from receipts where status = 'pending_review'
    `;
    const [{ n: totalUsers }] = await sql<{ n: number }>`select count(*)::int as n from "user"`;
    return { pendingPrices, openMessages, totalReceipts, pendingReceipts, totalUsers };
  });

export type AdminReceiptRow = {
  id: number;
  status: string;
  created_at: string;
  purchase_date: string | null;
  store_id: string | null;
  store_name: string | null;
  user_email: string | null;
  user_name: string | null;
  item_count: number;
};

export const listAllReceipts = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<AdminReceiptRow>`
      select
        r.id, r.status, r.created_at::text as created_at, r.purchase_date::text as purchase_date,
        r.store_id, s.name as store_name, u.email as user_email, u.name as user_name,
        coalesce(jsonb_array_length(r.parsed -> 'items'), 0) as item_count
      from receipts r
      left join stores s on s.id = r.store_id
      left join "user" u on u."id" = r.user_id
      order by r.created_at desc
      limit 100
    `;
  });

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  receipt_count: number;
  message_count: number;
};

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<AdminUserRow>`
      select
        u."id", u."name", u."email", u."createdAt"::text as created_at,
        coalesce((select count(*) from receipts r where r.user_id = u."id"), 0)::int as receipt_count,
        coalesce((select count(*) from messages m where m.user_id = u."id"), 0)::int as message_count
      from "user" u
      order by u."createdAt" desc
      limit 200
    `;
  });
