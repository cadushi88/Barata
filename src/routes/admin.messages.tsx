import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listAllMessages, replyToMessage } from "@/lib/server/messages";

export const Route = createFileRoute("/admin/messages")({ component: MessagesPage });

function MessagesPage() {
  const qc = useQueryClient();
  const messages = useQuery({ queryKey: ["admin-messages"], queryFn: () => listAllMessages() });
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const reply = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) => replyToMessage({ data: { id, reply } }),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
      setDrafts((d) => ({ ...d, [vars.id]: "" }));
    },
  });

  const rows = messages.data ?? [];

  return (
    <>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Messages</h1>
      <p className="mt-1 text-sm text-muted">Notes users have sent you, open ones first.</p>
      <div className="mt-4 space-y-3">
        {rows.map((m) => (
          <div key={m.id} className="rounded-md border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-medium">{m.user_name ?? m.user_email ?? "Unknown user"}</div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${m.status === "open" ? "text-warn" : "text-faint"}`}>{m.status}</span>
                <span className="text-xs text-faint">{new Date(m.created_at).toLocaleString()}</span>
              </div>
            </div>
            <p className="mt-2 text-sm">{m.body}</p>
            {m.admin_reply ? (
              <div className="mt-3 rounded-lg bg-bg px-3 py-2 text-sm">
                <p className="mb-1 text-xs uppercase tracking-wide text-faint">Your reply</p>
                {m.admin_reply}
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  className="h-10 flex-1 rounded-lg border border-line bg-bg px-3 text-sm"
                  placeholder="Reply…"
                  value={drafts[m.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                />
                <button
                  type="button"
                  disabled={!drafts[m.id]?.trim() || reply.isPending}
                  className="h-10 shrink-0 rounded-lg bg-ink px-4 text-sm text-bg disabled:opacity-40"
                  onClick={() => reply.mutate({ id: m.id, reply: (drafts[m.id] ?? "").trim() })}
                >
                  Send
                </button>
              </div>
            )}
          </div>
        ))}
        {!messages.isLoading && rows.length === 0 ? <p className="text-sm text-faint">No messages yet.</p> : null}
      </div>
    </>
  );
}
