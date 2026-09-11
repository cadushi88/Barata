import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approveScrapedPrice, listPendingPrices, rejectScrapedPrice } from "@/lib/server/scrape-review";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/admin/prices")({ component: PricesPage });

const SOURCE_LABEL: Record<string, string> = { scrape: "Scraper", receipt: "Receipt", manual: "Manual report" };

function PricesPage() {
  const qc = useQueryClient();
  const pending = useQuery({ queryKey: ["admin-pending-prices"], queryFn: () => listPendingPrices() });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-pending-prices"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const approve = useMutation({ mutationFn: (id: number) => approveScrapedPrice({ data: { id } }), onSuccess: invalidate });
  const reject = useMutation({ mutationFn: (id: number) => rejectScrapedPrice({ data: { id } }), onSuccess: invalidate });

  const rows = pending.data ?? [];

  return (
    <>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Price approvals</h1>
      <p className="mt-1 text-sm text-muted">
        Every price change — scraped, from a receipt, or a shopper's one-off report — waits here until you approve it.
      </p>
      <div className="mt-4 space-y-2">
        {rows.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <div className="truncate">
                {p.raw_name}
                {p.raw_unit ? <span className="text-faint"> · {p.raw_unit}</span> : null}
              </div>
              <div className="text-xs text-faint">
                {p.store_name} · {SOURCE_LABEL[p.source] ?? p.source}
                {p.user_email ? ` · ${p.user_email}` : ""} ·{" "}
                {p.matched_product_id ? (
                  <>
                    matched <span className="text-ink">{p.matched_product_name}</span>
                    {p.match_confidence ? ` (${Math.round(Number(p.match_confidence) * 100)}%)` : ""}
                  </>
                ) : (
                  "no match"
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="tabular-nums font-medium">{xcg(Number(p.raw_price))}</span>
              <button
                type="button"
                disabled={!p.matched_product_id || approve.isPending}
                className="h-8 rounded-lg bg-ink px-3 text-xs text-bg disabled:opacity-40"
                onClick={() => approve.mutate(p.id)}
              >
                Approve
              </button>
              <button
                type="button"
                disabled={reject.isPending}
                className="h-8 rounded-lg border border-line px-3 text-xs text-ink disabled:opacity-40"
                onClick={() => reject.mutate(p.id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!pending.isLoading && rows.length === 0 ? <p className="text-sm text-faint">Nothing pending.</p> : null}
      </div>
    </>
  );
}
