import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/shell";
import {
  approveScrapedPrice,
  bulkApproveHighConfidence,
  getScrapeRunDetail,
  listScrapeRuns,
  rejectScrapedPrice,
  triggerScrapeRun,
} from "@/lib/server/scrape-review";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/admin/scrape-review")({ component: ScrapeReviewPage });

function ScrapeReviewPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const runs = useQuery({ queryKey: ["scrape-runs"], queryFn: () => listScrapeRuns() });
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const activeRunId = selectedRunId ?? runs.data?.[0]?.id ?? null;
  const detail = useQuery({
    queryKey: ["scrape-run-detail", activeRunId],
    queryFn: () => getScrapeRunDetail({ data: { runId: activeRunId as number } }),
    enabled: activeRunId != null,
  });

  const trigger = useMutation({
    mutationFn: () => triggerScrapeRun(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-runs"] }),
  });
  const approve = useMutation({
    mutationFn: (id: number) => approveScrapedPrice({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] }),
  });
  const reject = useMutation({
    mutationFn: (id: number) => rejectScrapedPrice({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] }),
  });
  const bulkApprove = useMutation({
    mutationFn: () => bulkApproveHighConfidence({ data: { runId: activeRunId as number } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scrape-run-detail", activeRunId] }),
  });

  if (isPending) {
    return (
      <Shell>
        <div className="h-32 animate-pulse rounded-md bg-line/60" />
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const pending = (detail.data?.prices ?? []).filter((p) => p.status === "pending");
  const matched = pending.filter((p) => p.matched_product_id != null);
  const unmatched = pending.filter((p) => p.matched_product_id == null);

  return (
    <Shell>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Scraper review</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Scraped prices land here first — nothing reaches the public catalog until it's approved.
          </p>
        </div>
        <button
          type="button"
          className="h-10 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg disabled:opacity-60"
          disabled={trigger.isPending}
          onClick={() => trigger.mutate()}
        >
          {trigger.isPending ? "Running…" : "Run scraper now"}
        </button>
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
                {pending.length === 0 ? <p className="text-sm text-faint">Nothing pending for this run.</p> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  );
}
