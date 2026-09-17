import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";
import { myMessages, sendMessage } from "@/lib/server/messages";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
  head: () => ({ meta: [{ title: "Messages — Barata" }] }),
});

function MessagesPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const authErrorMessage = useAuthErrorMessage();
  const messages = useQuery({ queryKey: ["my-messages"], queryFn: () => myMessages(), enabled: Boolean(user) });
  // `isPending` only flips on the next render, so two clicks landing in the same tick
  // both pass it and send the message twice. The ref closes that window synchronously.
  const submitting = useRef(false);
  const send = useMutation({
    mutationFn: () => sendMessage({ data: { body } }),
    onSuccess: (res) => {
      if (res.ok) {
        setSendError(null);
        setBody("");
        qc.invalidateQueries({ queryKey: ["my-messages"] });
      } else {
        setSendError(res.error);
      }
    },
    onError: (err) => {
      setSendError(authErrorMessage(err, "Could not send — try again."));
    },
    onSettled: () => {
      submitting.current = false;
    },
  });

  if (isPending) {
    return (
      <Shell>
        <div className="h-32 animate-pulse rounded-md bg-line/60" />
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const rows = messages.data ?? [];

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Messages</h1>
      <p className="mt-1 max-w-xl text-sm text-muted">
        Send a note to Barata — a wrong price, a store we're missing, anything. We'll reply here.
      </p>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (submitting.current) return;
          if (body.trim()) {
            submitting.current = true;
            send.mutate();
          }
        }}
      >
        <textarea
          className="min-h-24 w-full rounded-md border border-line bg-surface p-3 text-sm"
          placeholder="What's on your mind?"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          type="submit"
          disabled={!body.trim() || send.isPending}
          className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60"
        >
          {send.isPending ? "Sending…" : "Send"}
        </button>
        {sendError ? (
          <p role="alert" className="text-sm text-warn">
            {sendError}
          </p>
        ) : null}
      </form>

      <div className="mt-8 space-y-3">
        {rows.map((m) => (
          <div key={m.id} className="rounded-md border border-line bg-surface p-4 text-sm">
            <p className="text-xs text-faint">{new Date(m.created_at).toLocaleString()}</p>
            <p className="mt-1">{m.body}</p>
            {m.admin_reply ? (
              <div className="mt-3 rounded-lg bg-bg px-3 py-2">
                <p className="mb-1 text-xs uppercase tracking-wide text-faint">Reply</p>
                {m.admin_reply}
              </div>
            ) : (
              <p className="mt-2 text-xs text-faint">Waiting on a reply…</p>
            )}
          </div>
        ))}
      </div>
    </Shell>
  );
}
