import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAdminOverview } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/")({ component: AdminOverviewPage });

function AdminOverviewPage() {
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => getAdminOverview() });
  const d = overview.data;

  const cards = [
    { to: "/admin/prices", label: "Pending price approvals", value: d?.pendingPrices, tone: d && d.pendingPrices > 0 ? "warn" : "good" },
    { to: "/admin/receipts", label: "Receipts awaiting review", value: d?.pendingReceipts, tone: d && d.pendingReceipts > 0 ? "warn" : "good" },
    { to: "/admin/messages", label: "Open messages", value: d?.openMessages, tone: d && d.openMessages > 0 ? "warn" : "good" },
    { to: "/admin/receipts", label: "Total receipts", value: d?.totalReceipts, tone: "neutral" },
    { to: "/admin/users", label: "Total users", value: d?.totalUsers, tone: "neutral" },
  ] as const;

  return (
    <>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Admin</h1>
      <p className="mt-1 text-sm text-muted">Everything that needs your attention, in one place.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-md border border-line bg-surface p-4 text-ink no-underline hover:border-primary"
          >
            <div
              className={`text-3xl font-semibold tabular-nums ${
                c.tone === "warn" ? "text-warn" : c.tone === "good" ? "text-good" : "text-ink"
              }`}
            >
              {overview.isLoading ? "…" : (c.value ?? 0)}
            </div>
            <div className="mt-1 text-sm text-muted">{c.label}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
