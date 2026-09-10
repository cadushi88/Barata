import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { getStore } from "@/lib/server/catalog";
import { ProductPhoto } from "@/components/product-photo";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/stores/$id")({ component: StorePage });

function StorePage() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["store", id], queryFn: () => getStore({ data: { id } }) });
  const store = q.data?.store;
  const items = q.data?.items ?? [];
  let lastCat = "";
  return (
    <Shell>
      {q.isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-line/60" />
      ) : !store ? (
        <p>Store not found.</p>
      ) : (
        <>
          <p className="text-xs text-muted">
            <Link to="/stores">Stores</Link>
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{store.name}</h1>
          <p className="text-sm text-muted">
            {store.area} · {store.address}
          </p>
          <p className="text-xs text-faint">{store.hours}</p>
          <div className="mt-6 space-y-2">
            {items.map((it) => {
              const show = it.category !== lastCat;
              lastCat = it.category;
              return (
                <div key={it.id}>
                  {show ? (
                    <h2 className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-faint">{it.category}</h2>
                  ) : null}
                  <Link
                    to="/products/$id"
                    params={{ id: String(it.id) }}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2 text-ink no-underline"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <ProductPhoto slug={it.slug} name={it.name} size="thumb" />
                      <span className="min-w-0">
                        <span className="block truncate">{it.name}</span>
                        <span className="text-xs text-faint">{it.unit}</span>
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums font-medium">{xcg(it.amount)}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Shell>
  );
}
