import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAllReceipts } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/receipts")({ component: ReceiptsPage });

const STATUS_TONE: Record<string, string> = {
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
      <p className="mt-1 text-sm text-muted">Every receipt anyone has uploaded, newest first.</p>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-4 py-3">{r.user_name ?? r.user_email ?? "—"}</td>
                <td className="px-4 py-3">{r.store_name ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{r.item_count}</td>
                <td className="px-4 py-3">{r.purchase_date ?? "—"}</td>
                <td className={`px-4 py-3 ${STATUS_TONE[r.status] ?? ""}`}>{r.status.replace("_", " ")}</td>
                <td className="px-4 py-3 text-faint">{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!receipts.isLoading && rows.length === 0 ? <p className="p-4 text-sm text-faint">No receipts yet.</p> : null}
      </div>
    </>
  );
}
