import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { adminMiddleware } from "@/lib/auth/admin-middleware";
import { z } from "zod";

/** Most messages one account may send per hour — a plain text field with no other rate limit would otherwise be a free spam channel to the admin's dashboard. */
const MAX_MESSAGES_PER_HOUR = 10;

export type MyMessageRow = {
  id: number;
  body: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { body: string }) => z.object({ body: z.string().trim().min(1).max(2000) }).parse(input))
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const [{ n: recent }] = await sql<{ n: number }>`
      select count(*)::int as n from messages
      where user_id = ${context.userId} and created_at > now() - interval '1 hour'
    `;
    if (recent >= MAX_MESSAGES_PER_HOUR) {
      return { ok: false as const, error: "Too many messages in the last hour — try again later" };
    }
    await sql`insert into messages (user_id, body) values (${context.userId}, ${data.body})`;
    return { ok: true as const };
  });

export const myMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<MyMessageRow>`
      select id, body, status, admin_reply, replied_at::text as replied_at, created_at::text as created_at
      from messages
      where user_id = ${context.userId}
      order by created_at desc
      limit 50
    `;
  });

export type AdminMessageRow = MyMessageRow & { user_email: string | null; user_name: string | null };

export const listAllMessages = createServerFn({ method: "GET" })
  .middleware([adminMiddleware])
  .handler(async () => {
    const sql = await getSql();
    return sql<AdminMessageRow>`
      select
        m.id, m.body, m.status, m.admin_reply, m.replied_at::text as replied_at, m.created_at::text as created_at,
        u.email as user_email, u.name as user_name
      from messages m
      left join "user" u on u."id" = m.user_id
      order by (m.status = 'open') desc, m.created_at desc
      limit 200
    `;
  });

export const replyToMessage = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .validator((input: { id: number; reply: string }) =>
    z.object({ id: z.number().int().positive(), reply: z.string().trim().min(1).max(2000) }).parse(input),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update messages set admin_reply = ${data.reply}, replied_at = now(), status = 'closed'
      where id = ${data.id}
    `;
    return { ok: true as const };
  });
