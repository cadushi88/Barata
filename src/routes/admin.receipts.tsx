import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAllReceipts } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/receipts")({ component: ReceiptsPage });

const STATUS_TONE: Record<string, string> = {
  awaiting_review: "text-warn",
  parsed: "text-faint",
  pending_review: "text-warn",
  committed: "text-good",
};

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
            </tr>
          </thead>
          <tbody>
            {receipts.isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-line">
                    {Array.from({ length: 7 }).map((_, j) => (
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
                  </tr>
                ))}
          </tbody>
        </table>
        {!receipts.isLoading && rows.length === 0 ? <p className="p-4 text-sm text-faint">No receipts yet.</p> : null}
      </div>
    </>
  );
}
