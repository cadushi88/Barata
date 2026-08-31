import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { cheapestBasket, getList, removeFromList } from "@/lib/server/catalog";
import { xcg, num } from "@/lib/money";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ProductPhoto } from "@/components/product-photo";
import { RedirectToSignIn } from "@/lib/auth/gates";

export const Route = createFileRoute("/list")({ component: ListPage });

function ListPage() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["list"],
    queryFn: () => getList(),
    enabled: !!user,
  });
  const ids = (list.data ?? []).map((r) => r.id);
  const basket = useQuery({
    queryKey: ["basket", ids.join(",")],
    queryFn: () => cheapestBasket({ data: { productIds: ids } }),
    enabled: ids.length > 0,
  });
  const rm = useMutation({
    mutationFn: (productId: number) => removeFromList({ data: { productId } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["list"] });
    },
  });

  if (isPending) {
    return (
      <Shell>
        <div className="h-32 animate-pulse rounded-2xl bg-line/60" />
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const winner = basket.data?.stores[0];

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Your list</h1>
      <p className="mt-2 text-sm text-muted md:text-base">We total the same basket at every supermarket so you can pick one trip.</p>

      {(list.data ?? []).length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Empty. Add items from the <Link to="/">catalog</Link>.
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-2">
            {(list.data ?? []).map((it) => (
              <li key={it.id} className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 py-2">
                <Link to="/products/$id" params={{ id: String(it.id) }} className="flex min-w-0 items-center gap-3 text-ink no-underline">
                  <ProductPhoto slug={it.slug} name={it.name} size="thumb" />
                  <div className="min-w-0">
                    <div className="truncate">{it.name}</div>
                    <div className="text-xs text-faint">
                      {it.category} · qty {num(it.qty)}
                    </div>
                  </div>
                </Link>
                <button type="button" className="h-10 shrink-0 px-2 text-sm text-muted" onClick={() => rm.mutate(it.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <h2 className="mt-10 font-display text-2xl">Cheapest full basket</h2>
          <div className="mt-4 grid gap-3">
            {(basket.data?.stores ?? []).map((s, i) => (
              <div
                key={s.store.id}
                className={`rounded-2xl border p-4 ${i === 0 ? "border-primary bg-surface" : "border-line bg-surface"}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <Link to="/stores/$id" params={{ id: s.store.id }} className="font-medium text-ink no-underline">
                      {s.store.name}
                    </Link>
                    <div className="text-xs text-muted">{s.store.area}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium tabular-nums">{xcg(s.total)}</div>
                    {s.missing ? <div className="text-xs text-warn">{s.missing} items missing</div> : null}
                    {i === 0 && winner ? <div className="text-xs text-good">Best complete total</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}
