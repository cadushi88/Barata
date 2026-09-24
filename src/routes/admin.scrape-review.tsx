import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  approveScrapedPrice,
  bulkApproveHighConfidence,
  getScrapeRunDetail,
  listScrapeRuns,
  rejectScrapedPrice,
  triggerScrapeRun,
} from "@/lib/server/scrape-review";
import { xcg } from "@/lib/money";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";

export const Route = createFileRoute("/admin/scrape-review")({ component: ScrapeReviewPage });

function ScrapeReviewPage() {
  const qc = useQueryClient();
  const runs = useQuery({ queryKey: ["scrape-runs"], queryFn: () => listScrapeRuns() });
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const activeRunId = selectedRunId ?? runs.data?.[0]?.id ?? null;
  const detail = useQuery({
    queryKey: ["scrape-run-detail", activeRunId],
    queryFn: () => getScrapeRunDetail({ data: { runId: activeRunId as number } }),
    enabled: activeRunId != null,
  });

  const authErrorMessage = useAuthErrorMessage();
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);
  // `isPending` only flips on the next render, so two clicks on the same row landing in
  // the same tick both pass it — this tracks in-flight row ids synchronously instead.
  const inFlight = useRef<Set<number>>(new Set());

  const trigger = useMutation({
    mutationFn: () => triggerScrapeRun(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-runs"] }),
  });
  const approve = useMutation({
    mutationFn: (id: number) => approveScrapedPrice({ data: { id } }),
    onSuccess: (res, id) => {
      if (!res.ok) {
        setRowError({ id, message: res.error });
        return;
      }
      setRowError((cur) => (cur?.id === id ? null : cur));
      qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] });
    },
    onError: (err, id) => {
      setRowError({ id, message: authErrorMessage(err, "Couldn't approve — try again.") });
    },
    onSettled: (_data, _err, id) => {
      inFlight.current.delete(id);
    },
  });
  const reject = useMutation({
    mutationFn: (id: number) => rejectScrapedPrice({ data: { id } }),
    onSuccess: (res, id) => {
      if (!res.ok) {
        setRowError({ id, message: res.error });
        return;
      }
      setRowError((cur) => (cur?.id === id ? null : cur));
      qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] });
    },
    onError: (err, id) => {
      setRowError({ id, message: authErrorMessage(err, "Couldn't reject — try again.") });
    },
    onSettled: (_data, _err, id) => {
      inFlight.current.delete(id);
    },
  });
  const bulkApprove = useMutation({
    mutationFn: () => bulkApproveHighConfidence({ data: { runId: activeRunId as number } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] }),
  });

  function approveRow(id: number) {
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    approve.mutate(id);
  }
  function rejectRow(id: number) {
    if (inFlight.current.has(id)) return;
    inFlight.current.add(id);
    reject.mutate(id);
  }

  const pending = (detail.data?.prices ?? []).filter((p) => p.status === "pending");
  const matched = pending.filter((p) => p.matched_product_id != null);
  const unmatched = pending.filter((p) => p.matched_product_id == null);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Scraper review</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Scraped prices land here first. Exact-name matches with a sane price get published
            automatically; anything fuzzy, unmatched, or price-suspicious waits here for review.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg disabled:opacity-60"
            disabled={trigger.isPending}
            onClick={() => trigger.mutate()}
          >
            {trigger.isPending ? "Running…" : "Run scraper now"}
          </button>
          {trigger.data ? (
            <p className="text-xs text-faint">
              Staged {trigger.data.totalStaged}, auto-published {trigger.data.autoApproved}.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="space-y-1.5">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Recent runs</h2>
          {(runs.data ?? []).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRunId(r.id)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-xs ${
                r.id === activeRunId ? "border-primary bg-primary/5" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">#{r.id}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                    r.status === "completed" ? "bg-good/10 text-good" : "bg-line text-muted"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-1 text-faint">{new Date(r.started_at).toLocaleString()}</div>
            </button>
          ))}
          {runs.data?.length === 0 ? <p className="text-xs text-faint">No runs yet.</p> : null}
        </div>

        <div>
          {!activeRunId ? (
            <p className="text-sm text-muted">Run the scraper, or pick a run from the list.</p>
          ) : detail.isLoading ? (
            <div className="h-40 animate-pulse rounded-md bg-line/60" />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {(detail.data?.storeResults ?? []).map((s) => (
                  <span
                    key={s.id}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      s.status === "success"
                        ? s.items_found > 0
                          ? "border-good/40 text-good"
                          : "border-line text-faint"
                        : "border-warn/40 text-warn"
                    }`}
                    title={s.error ?? undefined}
                  >
                    {s.store_name} · {s.status === "error" ? "error" : `${s.items_found} items`}
                  </span>
                ))}
              </div>

              {matched.length > 0 ? (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    {matched.length} matched, {unmatched.length} unmatched, pending review.
                  </p>
                  <button
                    type="button"
                    className="h-9 rounded-lg border border-line px-3 text-xs font-medium text-ink disabled:opacity-60"
                    disabled={bulkApprove.isPending}
                    onClick={() => bulkApprove.mutate()}
                  >
                    {bulkApprove.isPending ? "Approving…" : "Bulk-approve high-confidence matches"}
                  </button>
                </div>
              ) : null}

              <div className="mt-4 space-y-2">
                {pending.map((p) => (
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
                        {p.store_name} ·{" "}
                        {p.matched_product_id ? (
                          <>
                            matched <span className="text-ink">{p.matched_product_name}</span> (
                            {Math.round(Number(p.match_confidence) * 100)}%)
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
                        disabled={!p.matched_product_id || (approve.isPending && approve.variables === p.id)}
                        className="h-8 rounded-lg bg-ink px-3 text-xs text-bg disabled:opacity-40"
                        onClick={() => approveRow(p.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={reject.isPending && reject.variables === p.id}
                        className="h-8 rounded-lg border border-line px-3 text-xs text-ink disabled:opacity-40"
                        onClick={() => rejectRow(p.id)}
                      >
                        Reject
                      </button>
                    </div>
                    {rowError?.id === p.id ? (
                      <p role="alert" className="basis-full text-xs text-warn">
                        {rowError.message}
                      </p>
                    ) : null}
                  </div>
                ))}
                {pending.length === 0 ? <p className="text-sm text-faint">Nothing pending for this run.</p> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
