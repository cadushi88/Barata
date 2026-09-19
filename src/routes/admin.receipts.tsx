import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAllReceipts, type AdminReceiptRow } from "@/lib/server/admin";
import { useState } from "react";

export const Route = createFileRoute("/admin/receipts")({ component: ReceiptsPage });

const STATUS_TONE: Record<string, string> = {
  awaiting_review: "text-warn",
  parsed: "text-faint",
  pending_review: "text-warn",
  committed: "text-good",
};

/**
 * Builds the text a Claude Code session needs to transcribe this receipt without
 * any round trip through the app — everything but the photo itself, which the
 * button downloads separately (a Claude Code chat can't fetch an admin-gated URL
 * on its own, so the image has to be attached by hand).
 */
function claudeCodePrompt(r: AdminReceiptRow): string {
  const lines = [
    `Please transcribe this Barata receipt and land its prices as a migration into scraped_prices (see how earlier receipt-batch migrations did it) — receipt #${r.id}.`,
    `Store: ${r.store_name ?? "not specified — guess from the text/photo if possible"}`,
    `Purchase date: ${r.purchase_date ?? "not specified — guess from the text/photo if possible"}`,
  ];
  if (r.has_photo) lines.push("A photo was downloaded alongside this — attach it to your message.");
  if (r.raw_text) lines.push("", "Raw text as typed by the submitter:", r.raw_text);
  return lines.join("\n");
}

function CopyForClaudeButton({ row }: { row: AdminReceiptRow }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="h-8 rounded-lg border border-line bg-bg px-3 text-xs font-medium hover:bg-line/40"
      onClick={async () => {
        await navigator.clipboard.writeText(claudeCodePrompt(row));
        if (row.has_photo) {
          const a = document.createElement("a");
          a.href = `/api/admin-receipt-photo/${row.id}`;
          a.download = `barata-receipt-${row.id}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "Copied + downloaded ✓" : "Copy for Claude Code"}
    </button>
  );
}

function ReceiptsPage() {
  const receipts = useQuery({ queryKey: ["admin-receipts"], queryFn: () => listAllReceipts() });
  const rows = receipts.data ?? [];

  return (
    <>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Receipts</h1>
      <p className="mt-1 text-sm text-muted">
        Every receipt anyone has uploaded, newest first. <strong>Awaiting review</strong> rows haven't been read by
        AI (that costs money) — open the photo/text below, hand it to a Claude Code session to transcribe, and it
        lands as a normal migration into the price-approval queue.
      </p>
      <div className="mt-4 overflow-x-auto rounded-md border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-bg text-left text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Purchase date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Photo / text</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-line">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-full max-w-28 animate-pulse rounded bg-line/60" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((r) => (
                  <tr key={r.id} className="border-t border-line align-top">
                    <td className="px-4 py-3">{r.user_name ?? r.user_email ?? "—"}</td>
                    <td className="px-4 py-3">{r.store_name ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.item_count}</td>
                    <td className="px-4 py-3">{r.purchase_date ?? "—"}</td>
                    <td className={`px-4 py-3 ${STATUS_TONE[r.status] ?? ""}`}>{r.status.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-faint">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {r.has_photo ? (
                        <a href={`/api/admin-receipt-photo/${r.id}`} target="_blank" rel="noreferrer">
                          <img
                            src={`/api/admin-receipt-photo/${r.id}`}
                            alt={`Receipt #${r.id}`}
                            className="h-16 w-16 rounded-md border border-line object-cover hover:opacity-80"
                          />
                        </a>
                      ) : null}
                      {r.raw_text ? (
                        <pre className="mt-1 max-w-xs overflow-x-auto whitespace-pre-wrap text-xs text-muted">
                          {r.raw_text}
                        </pre>
                      ) : null}
                      {!r.has_photo && !r.raw_text ? <span className="text-faint">—</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === "awaiting_review" ? <CopyForClaudeButton row={r} /> : null}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!receipts.isLoading && rows.length === 0 ? <p className="p-4 text-sm text-faint">No receipts yet.</p> : null}
      </div>
    </>
  );
}
