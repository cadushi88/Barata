import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAllPending,
  approveScrapedPrice,
  confirmClosestGuess,
  listPendingPrices,
  rejectAllUnmatched,
  rejectScrapedPrice,
  searchProductsForLinking,
} from "@/lib/server/scrape-review";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/admin/prices")({ component: PricesPage });

const SOURCE_LABEL: Record<string, string> = { scrape: "Scraper", receipt: "Receipt", manual: "Manual report" };

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** The "link to a product…" search box for a row an admin has verified by hand. */
function LinkToProductBox({
  onPick,
  onCancel,
  disabled,
}: {
  onPick: (productId: number) => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 250);
  const results = useQuery({
    queryKey: ["admin-product-search", debouncedQ],
    queryFn: () => searchProductsForLinking({ data: { q: debouncedQ } }),
    enabled: debouncedQ.trim().length >= 2,
  });

  return (
    <div className="mt-2 rounded-md border border-line bg-bg p-2">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the catalog by name or brand…"
          className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-xs outline-none"
        />
        <button type="button" className="h-8 shrink-0 px-2 text-xs text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {debouncedQ.trim().length >= 2 ? (
        <div className="mt-1.5 max-h-48 space-y-1 overflow-y-auto">
          {results.isLoading ? (
            <p className="px-1 py-1 text-xs text-faint">Searching…</p>
          ) : (results.data ?? []).length === 0 ? (
            <p className="px-1 py-1 text-xs text-faint">No products match “{debouncedQ.trim()}”.</p>
          ) : (
            (results.data ?? []).map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={disabled}
                className="block w-full rounded px-1.5 py-1 text-left text-xs hover:bg-surface disabled:opacity-60"
                onClick={() => onPick(r.id)}
              >
                <span className="text-ink">{r.name}</span>
                <span className="text-faint">
                  {r.brand ? ` · ${r.brand}` : ""} · {r.unit}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

function PricesPage() {
  const qc = useQueryClient();
  const pending = useQuery({ queryKey: ["admin-pending-prices"], queryFn: () => listPendingPrices() });
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-pending-prices"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const approve = useMutation({ mutationFn: (id: number) => approveScrapedPrice({ data: { id } }), onSuccess: invalidate });
  const reject = useMutation({ mutationFn: (id: number) => rejectScrapedPrice({ data: { id } }), onSuccess: invalidate });
  const [guessErrors, setGuessErrors] = useState<Record<number, string>>({});
  const confirmGuess = useMutation({
    mutationFn: (vars: { id: number; productId: number; confidence: number | null }) =>
      confirmClosestGuess({ data: vars }),
    onSuccess: (_res, vars) => {
      setGuessErrors((prev) => {
        const next = { ...prev };
        delete next[vars.id];
        return next;
      });
      setLinkingRowId((cur) => (cur === vars.id ? null : cur));
      invalidate();
    },
    onError: (_err, vars) => setGuessErrors((prev) => ({ ...prev, [vars.id]: "Couldn't link that — try again." })),
  });
  // "Save for later" is purely local — the row is already sitting in the
  // queue untouched, this just hides the Yes/No prompt for this browsing
  // session so it doesn't nag on every glance at the page.
  const [dismissedGuesses, setDismissedGuesses] = useState<Set<number>>(new Set());
  // Which row currently has its "link to a product…" search box open — at
  // most one at a time, since it's a rare, deliberate action per row.
  const [linkingRowId, setLinkingRowId] = useState<number | null>(null);
  const [acceptAllError, setAcceptAllError] = useState<string | null>(null);
  const acceptAll = useMutation({
    mutationFn: () => approveAllPending(),
    onSuccess: () => {
      setAcceptAllError(null);
      invalidate();
    },
    onError: () => setAcceptAllError("Couldn't approve everything — try again."),
  });
  const [rejectAllError, setRejectAllError] = useState<string | null>(null);
  const rejectAll = useMutation({
    mutationFn: () => rejectAllUnmatched(),
    onSuccess: () => {
      setRejectAllError(null);
      invalidate();
    },
    onError: () => setRejectAllError("Couldn't reject everything — try again."),
  });

  const rows = pending.data ?? [];
  const matchedCount = rows.filter((p) => p.matched_product_id).length;
  const unmatchedCount = rows.length - matchedCount;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Price approvals</h1>
          <p className="mt-1 text-sm text-muted">
            Every price change — scraped, from a receipt, or a shopper's one-off report — waits here until you approve it.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {unmatchedCount > 0 ? (
            <button
              type="button"
              disabled={rejectAll.isPending}
              className="h-10 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:opacity-60"
              onClick={() => {
                if (!window.confirm(`Reject all ${unmatchedCount} unmatched, pending rows? They won't be published — this just clears them from the queue.`)) {
                  return;
                }
                rejectAll.mutate();
              }}
            >
              {rejectAll.isPending ? "Rejecting…" : `Reject all unmatched (${unmatchedCount})`}
            </button>
          ) : null}
          {matchedCount > 0 ? (
            <button
              type="button"
              disabled={acceptAll.isPending}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg disabled:opacity-60"
              onClick={() => {
                if (!window.confirm(`Approve all ${matchedCount} matched, pending prices? This publishes them to the catalog immediately.`)) {
                  return;
                }
                acceptAll.mutate();
              }}
            >
              {acceptAll.isPending ? "Approving…" : `Accept all (${matchedCount})`}
            </button>
          ) : null}
        </div>
      </div>
      {acceptAllError ? (
        <p role="alert" className="mt-2 text-sm text-warn">
          {acceptAllError}
        </p>
      ) : null}
      {rejectAllError ? (
        <p role="alert" className="mt-2 text-sm text-warn">
          {rejectAllError}
        </p>
      ) : null}
      <div className="mt-4 space-y-2">
        {pending.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-line/60" />
            ))
          : rows.map((p) => (
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
                    ) : p.closest_guess_name ? (
                      <>
                        no match · closest guess: <span className="text-ink">{p.closest_guess_name}</span>
                        {p.closest_guess_confidence != null ? ` (${Math.round(p.closest_guess_confidence * 100)}%)` : ""}
                      </>
                    ) : (
                      "no match"
                    )}
                  </div>
                  {p.closest_guess_product_id != null && !dismissedGuesses.has(p.id) ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-faint">Is that right?</span>
                      <button
                        type="button"
                        disabled={confirmGuess.isPending}
                        className="h-6 rounded-full bg-primary px-2.5 text-[11px] font-medium text-primary-fg disabled:opacity-60"
                        onClick={() =>
                          confirmGuess.mutate({
                            id: p.id,
                            productId: p.closest_guess_product_id!,
                            confidence: p.closest_guess_confidence,
                          })
                        }
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        disabled={reject.isPending}
                        className="h-6 rounded-full border border-line px-2.5 text-[11px] font-medium text-ink disabled:opacity-60"
                        onClick={() => reject.mutate(p.id)}
                      >
                        No
                      </button>
                      <button
                        type="button"
                        className="h-6 rounded-full px-2.5 text-[11px] font-medium text-muted"
                        onClick={() => setDismissedGuesses((prev) => new Set(prev).add(p.id))}
                      >
                        Save for later
                      </button>
                    </div>
                  ) : null}
                  {p.matched_product_id == null ? (
                    linkingRowId === p.id ? (
                      <LinkToProductBox
                        disabled={confirmGuess.isPending}
                        onCancel={() => setLinkingRowId(null)}
                        onPick={(productId) => confirmGuess.mutate({ id: p.id, productId, confidence: null })}
                      />
                    ) : (
                      <button
                        type="button"
                        className="mt-1 block text-xs font-medium text-primary underline-offset-2 hover:underline"
                        onClick={() => setLinkingRowId(p.id)}
                      >
                        {/* For when a reviewer has personally checked the webshop and knows the real
                            match, rather than waiting on the algorithm's guess (or when it found none). */}
                        Link to a product…
                      </button>
                    )
                  ) : null}
                  {guessErrors[p.id] ? (
                    <p role="alert" className="mt-1 text-xs text-warn">
                      {guessErrors[p.id]}
                    </p>
                  ) : null}
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
