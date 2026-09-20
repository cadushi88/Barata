import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import {
  addToList,
  getProduct,
  getPriceHistory,
  listStores,
  addPrice,
  adminSetPrice,
  updateProductName,
  MAX_PRICE_XCG,
} from "@/lib/server/catalog";
import { xcg, num } from "@/lib/money";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";
import { useIsAdmin } from "@/lib/auth/use-is-admin";
import { ProductPhoto } from "@/components/product-photo";
import { AdminPhotoUpload } from "@/components/admin-photo-upload";
import { PriceHistoryChart } from "@/components/price-history-chart";
import { useState, useMemo, useRef } from "react";

export const Route = createFileRoute("/products/$id")({
  component: ProductPage,
  // Only for the SEO title below — the page's own data (prices, history) still
  // comes entirely from the component's existing `useQuery` calls, unchanged.
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) return { product: null };
    const { product } = await getProduct({ data: { id } });
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.product ? `${loaderData.product.name} — Barata` : "Product — Barata" }],
  }),
});

function ProductPage() {
  const { id } = Route.useParams();
  const pid = Number(id);
  // /products/anything-non-numeric would otherwise send NaN to Postgres
  // ("invalid input syntax for type integer"), so the page sat on a loading
  // skeleton through three react-query retries before admitting defeat.
  const validId = Number.isInteger(pid) && pid > 0;
  const { user } = useCurrentUserState();
  const { isAdmin } = useIsAdmin();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["product", pid],
    queryFn: () => getProduct({ data: { id: pid } }),
    enabled: validId,
  });
  const history = useQuery({
    queryKey: ["price-history", pid],
    queryFn: () => getPriceHistory({ data: { id: pid } }),
    enabled: validId,
  });
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  const [storeId, setStoreId] = useState("");
  const [amount, setAmount] = useState("");
  const [priceError, setPriceError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const renameMut = useMutation({
    mutationFn: () => updateProductName({ data: { productId: pid, name: nameDraft.trim() } }),
    onSuccess: (res) => {
      if (!res.ok) {
        setNameError(res.error);
        return;
      }
      setNameError(null);
      setEditingName(false);
      qc.invalidateQueries({ queryKey: ["product", pid] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => setNameError("Could not save — try again."),
  });
  // Mirrors the "Added ✓" confirmation used on the catalog cards — reverts on its
  // own after a moment so the button doesn't get stuck announcing an old click.
  const [justAdded, setJustAdded] = useState(false);
  const [addListError, setAddListError] = useState<string | null>(null);
  const authErrorMessage = useAuthErrorMessage();
  // `isPending` only flips on the next render, so two clicks landing in the same tick
  // both pass it and fire the mutation twice. The ref closes that window synchronously.
  const addListSubmitting = useRef(false);
  const addL = useMutation({
    mutationFn: () => addToList({ data: { productId: pid } }),
    onSuccess: () => {
      setAddListError(null);
      qc.invalidateQueries({ queryKey: ["list"] });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    },
    onError: (err) => {
      setAddListError(authErrorMessage(err, "Couldn't add that — try again."));
    },
    onSettled: () => {
      addListSubmitting.current = false;
    },
  });
  const [priceSubmitError, setPriceSubmitError] = useState<string | null>(null);
  const submitting = useRef(false);
  const addP = useMutation({
    mutationFn: (): Promise<{ ok: true } | { ok: false; error: string }> =>
      isAdmin
        ? adminSetPrice({ data: { productId: pid, storeId, amount: Number(amount) } })
        : addPrice({ data: { productId: pid, storeId, amount: Number(amount) } }),
    onSuccess: (data) => {
      if (!data.ok) {
        setPriceSubmitError(data.error);
        return;
      }
      setPriceSubmitError(null);
      setAmount("");
      qc.invalidateQueries({ queryKey: ["product", pid] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["price-history", pid] });
    },
    onError: (err) => {
      setPriceSubmitError(authErrorMessage(err, "Could not save — try again."));
    },
    onSettled: () => {
      submitting.current = false;
    },
  });

  const product = q.data?.product;
  const prices = q.data?.prices ?? [];
  const min = prices.length ? Math.min(...prices.map((p) => num(p.amount))) : 0;

  // Build a chart-friendly series: one row per date, one column per store, with each
  // store's price forward-filled between observations (a price holds until it's updated
  // again — this is standard for price-history charts, not fabricated data).
  const chart = useMemo(() => {
    const rows = history.data ?? [];
    const storeNames = [...new Set(rows.map((r) => r.store_name))];
    const dates = [...new Set(rows.map((r) => r.observed_at.slice(0, 10)))].sort();
    const latestByStore: Record<string, number> = {};
    const series = dates.map((date) => {
      const point: Record<string, string | number> = { date };
      for (const r of rows.filter((x) => x.observed_at.slice(0, 10) === date)) {
        latestByStore[r.store_name] = r.amount;
      }
      for (const name of storeNames) {
        if (latestByStore[name] !== undefined) point[name] = latestByStore[name];
      }
      return point;
    });
    return { series, storeNames, dates, hasEnoughData: dates.length >= 2 };
  }, [history.data]);

  return (
    <Shell>
      {q.isLoading ? (
        <div className="h-40 animate-pulse rounded-md bg-line/60" />
      ) : !product ? (
        <p>Product not found.</p>
      ) : (
        <>
          <p className="text-xs text-muted">
            <Link to="/" className="text-muted">Catalog</Link> / {product.category}
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,22rem)_1fr] md:items-start">
            <div className="space-y-3">
              <ProductPhoto productId={product.id} slug={product.slug} name={product.name} size="hero" imageUrl={product.image_url} />
              {isAdmin ? <AdminPhotoUpload productId={product.id} /> : null}
            </div>
            <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              {isAdmin && editingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    autoFocus
                    aria-label="Product name"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-2 font-display text-xl font-semibold md:text-2xl"
                    value={nameDraft}
                    onChange={(e) => {
                      setNameDraft(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !renameMut.isPending) renameMut.mutate();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                  />
                  <button
                    type="button"
                    disabled={renameMut.isPending || !nameDraft.trim()}
                    onClick={() => renameMut.mutate()}
                    className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg disabled:opacity-60"
                  >
                    {renameMut.isPending ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="h-9 rounded-lg border border-line px-3 text-sm"
                  >
                    Cancel
                  </button>
                  {nameError ? <p className="w-full text-xs text-warn">{nameError}</p> : null}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-semibold md:text-3xl">{product.name}</h1>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNameDraft(product.name);
                        setNameError(null);
                        setEditingName(true);
                      }}
                      className="h-7 rounded-lg border border-line px-2 text-xs text-muted hover:bg-line/40"
                    >
                      Edit
                    </button>
                  ) : null}
                </div>
              )}
              <p className="text-sm text-muted">
                {product.unit}
                {product.brand ? ` · ${product.brand}` : ""}
              </p>
              {product.needs_review ? (
                <p className="mt-1 text-xs text-warn">
                  Needs review: this name may be missing its product type (imported from a source that only listed the brand).
                </p>
              ) : null}
            </div>
            {user ? (
              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  disabled={addL.isPending || justAdded}
                  onClick={() => {
                    if (addListSubmitting.current) return;
                    addListSubmitting.current = true;
                    addL.mutate();
                  }}
                  className="h-11 w-full rounded-full bg-primary px-4 text-sm font-medium text-primary-fg disabled:opacity-70 sm:w-auto"
                >
                  {addL.isPending ? "Adding…" : justAdded ? "Added ✓" : "Add to list"}
                </button>
                {addListError ? (
                  <p role="alert" className="mt-1 text-xs text-warn">
                    {addListError}
                  </p>
                ) : null}
              </div>
            ) : null}
            </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-ink bg-bg p-3 md:hidden">
            <div className="space-y-1.5 border-t border-dashed border-line pt-1 first:border-t-0 first:pt-0">
              {prices.map((p) => {
                const amt = num(p.amount);
                const delta = amt - min;
                const cheapest = delta < 0.01;
                return (
                  <Link
                    key={p.store_id}
                    to="/stores/$id"
                    params={{ id: p.store_id }}
                    className={`flex items-baseline gap-1.5 rounded px-1.5 py-1 no-underline ${cheapest ? "bg-good/10" : ""}`}
                  >
                    <span className={`truncate font-mono text-xs font-bold uppercase ${cheapest ? "text-ink" : "text-muted"}`}>
                      {p.store_name}
                    </span>
                    <span className="mb-[3px] grow border-b-2 border-dotted border-ink/25" />
                    <span className={`shrink-0 font-mono text-sm font-bold tabular-nums ${cheapest ? "text-good" : "text-ink"}`}>
                      {xcg(amt)}
                    </span>
                    {cheapest ? (
                      <span className="shrink-0 -rotate-3 rounded border border-good px-1 font-mono text-[9px] font-bold text-good">
                        CHEAPEST
                      </span>
                    ) : (
                      <span className="shrink-0 font-mono text-[10px] text-faint">+{xcg(delta)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-6 hidden overflow-x-auto rounded-md border border-line bg-surface md:block">
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

          {chart.hasEnoughData ? (
            <div className="mt-6 rounded-md border border-line bg-surface p-4">
              <h2 className="font-medium">Price history</h2>
              <p className="mt-1 text-xs text-faint">
                Shown as the last known price at each store between updates — not every day is a new observation.
              </p>
              <PriceHistoryChart series={chart.series} storeNames={chart.storeNames} />
            </div>
          ) : history.data && history.data.length > 0 ? (
            // A chart needs two dates, not two prices: over a third of the catalog was
            // seeded from a single survey day, so "only one price point" would be a
            // flat lie on a page already listing a dozen store prices.
            <p className="mt-6 text-sm text-faint">
              {history.data.length === 1
                ? "Only one price recorded so far — history will appear here once more prices come in over time."
                : `All ${history.data.length} recorded prices come from a single day (${chart.dates[0]}) — a trend line appears once prices are logged on another day.`}
            </p>
          ) : null}

          {user ? (
            <form
              className="mt-6 grid gap-3 rounded-md border border-line bg-surface p-4 sm:flex sm:flex-wrap sm:items-end"
              aria-label={isAdmin ? "Set price directly" : "Report a price"}
              onSubmit={(e) => {
                e.preventDefault();
                if (submitting.current) return;
                if (!(Number(amount) > 0)) {
                  setPriceError("Enter a price greater than 0");
                  return;
                }
                if (Number(amount) > MAX_PRICE_XCG) {
                  setPriceError(`Price can't exceed ${xcg(MAX_PRICE_XCG)}`);
                  return;
                }
                setPriceError(null);
                setPriceSubmitError(null);
                if (storeId) {
                  submitting.current = true;
                  addP.mutate();
                }
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
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (priceError) setPriceError(null);
                  }}
                  required
                />
              </label>
              <button
                type="submit"
                disabled={addP.isPending}
                className="h-11 w-full rounded-xl bg-ink px-4 text-sm text-bg disabled:opacity-60 sm:w-auto"
              >
                {addP.isPending ? "Saving…" : isAdmin ? "Save price" : "Submit price"}
              </button>
              {priceError ? <span className="text-sm text-warn">{priceError}</span> : null}
              {!priceError && addP.isSuccess && !priceSubmitError ? (
                <span className="text-sm text-good">{isAdmin ? "Price updated ✓" : "Submitted for review"}</span>
              ) : null}
              {!priceError && priceSubmitError ? (
                <span role="alert" className="text-sm text-warn">
                  {priceSubmitError}
                </span>
              ) : null}
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
