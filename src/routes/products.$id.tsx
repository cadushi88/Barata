import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { addToList, getProduct, listStores, addPrice } from "@/lib/server/catalog";
import { xcg, num } from "@/lib/money";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ProductPhoto } from "@/components/product-photo";
import { useState } from "react";

export const Route = createFileRoute("/products/$id")({ component: ProductPage });

function ProductPage() {
  const { id } = Route.useParams();
  const pid = Number(id);
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["product", pid], queryFn: () => getProduct({ data: { id: pid } }) });
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  const [storeId, setStoreId] = useState("");
  const [amount, setAmount] = useState("");
  const addL = useMutation({
    mutationFn: () => addToList({ data: { productId: pid } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list"] }),
  });
  const addP = useMutation({
    mutationFn: () => addPrice({ data: { productId: pid, storeId, amount: Number(amount) } }),
    onSuccess: () => {
      setAmount("");
      qc.invalidateQueries({ queryKey: ["product", pid] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const product = q.data?.product;
  const prices = q.data?.prices ?? [];
  const min = prices.length ? Math.min(...prices.map((p) => num(p.amount))) : 0;

  return (
    <Shell>
      {q.isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-line/60" />
      ) : !product ? (
        <p>Product not found.</p>
      ) : (
        <>
          <p className="text-xs text-muted">
            <Link to="/" className="text-muted">Catalog</Link> / {product.category}
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
            <ProductPhoto slug={product.slug} name={product.name} size="hero" />
            <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold md:text-3xl">{product.name}</h1>
              <p className="text-sm text-muted">
                {product.unit}
                {product.brand ? ` · ${product.brand}` : ""}
              </p>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => addL.mutate()}
                className="h-11 w-full rounded-full bg-primary px-4 text-sm font-medium text-primary-fg sm:w-auto"
              >
                Add to list
              </button>
            ) : null}
            </div>
            </div>
          </div>

          <div className="mt-5 space-y-2 md:hidden">
            {prices.map((p) => {
              const amt = num(p.amount);
              const delta = amt - min;
              return (
                <Link
                  key={p.store_id}
                  to="/stores/$id"
                  params={{ id: p.store_id }}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-ink no-underline"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">{p.store_name}</div>
                    <div className="text-xs text-faint">{String(p.observed_at).slice(0, 10)}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="tabular-nums font-medium">{xcg(amt)}</div>
                    <div className="text-xs">
                      {delta < 0.01 ? <span className="text-good">Cheapest</span> : <span className="text-muted">+{xcg(delta)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
            <table className="w-full text-sm">
              <thead className="bg-bg text-left text-xs uppercase tracking-wide text-faint">
                <tr>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">vs cheapest</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => {
                  const amt = num(p.amount);
                  const delta = amt - min;
                  return (
                    <tr key={p.store_id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <Link to="/stores/$id" params={{ id: p.store_id }} className="text-ink no-underline hover:text-primary">
                          {p.store_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">{xcg(amt)}</td>
                      <td className="px-4 py-3 tabular-nums text-muted">
                        {delta < 0.01 ? <span className="text-good">Cheapest</span> : `+${xcg(delta)}`}
                      </td>
                      <td className="px-4 py-3 text-faint">{String(p.observed_at).slice(0, 10)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {user ? (
            <form
              className="mt-6 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex sm:flex-wrap sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (storeId && Number(amount) > 0) addP.mutate();
              }}
            >
              <label className="block text-sm sm:flex-1">
                <span className="mb-1 block text-muted">Store</span>
                <select
                  className="h-11 w-full rounded-xl border border-line bg-bg px-3"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  required
                >
                  <option value="">Choose…</option>
                  {(stores.data ?? []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted">Price (XCG)</span>
                <input
                  className="h-11 w-full rounded-xl border border-line bg-bg px-3 tabular-nums sm:w-28"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="h-11 w-full rounded-xl bg-ink px-4 text-sm text-bg sm:w-auto">
                Submit price
              </button>
              {addP.isSuccess ? <span className="text-sm text-good">Saved</span> : null}
              {addP.isError ? <span className="text-sm text-warn">Could not save</span> : null}
            </form>
          ) : (
            <p className="mt-6 text-sm text-muted">
              <Link to="/login">Sign in</Link> to report a price you just saw.
            </p>
          )}
        </>
      )}
    </Shell>
  );
}
