import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { listStores } from "@/lib/server/catalog";

export const Route = createFileRoute("/stores")({ component: StoresPage });

function StoresPage() {
  const q = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Supermarkets</h1>
      <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
        Coverage starts with the chains Fundashon pa Konsumidó surveyed in 2026, plus Goisco.
        Budget stores tend to win on staples; premium stores win on Dutch imports.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(q.data ?? []).map((s) => (
          <Link
            key={s.id}
            to="/stores/$id"
            params={{ id: s.id }}
            className="rounded-2xl border border-line bg-surface p-4 text-ink no-underline hover:border-primary"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-sm text-muted">{s.area}</div>
              </div>
              <span className="rounded-full bg-bg px-2 py-0.5 text-xs capitalize text-muted">{s.price_tier}</span>
            </div>
            <p className="mt-3 text-xs text-faint">{s.hours}</p>
          </Link>
        ))}
      </div>
    </Shell>
  );
}
