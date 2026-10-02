import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { listCategories, getCatalogStats, searchProducts, addToList } from "@/lib/server/catalog";
import { xcg, num, splitXcg } from "@/lib/money";
import { ProductPhoto } from "@/components/product-photo";
import { getProductPhotosMeta } from "@/lib/server/product-photos";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";

// Both optional (rather than defaulted to "") so every other `<Link to="/">`
// in the app doesn't have to pass search params it doesn't care about, and
// so a cleared search/category drops out of the URL instead of lingering
// as `?q=&category=`.
type HomeSearch = { q?: string; category?: string };

export const Route = createFileRoute("/")({
  component: Home,
  // Search and category live in the URL (not component state) so that
  // following a product link and hitting the browser's back button lands
  // back on this exact search/filter instead of a reset, empty catalog.
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
  }),
  head: () => ({ meta: [{ title: "Barata — Compare grocery prices" }] }),
});

/** Shelf-tag price display: a big whole-number numeral with small superscript cents. */
function BigPrice({ amount }: { amount: number }) {
  const { whole, cents } = splitXcg(amount);
  return (
    <span className="inline-flex items-start font-display leading-none">
      <span className="mt-1 mr-1 self-start text-xs font-sans font-bold uppercase tracking-wide text-muted">XCG</span>
      <span className="text-3xl">{whole}</span>
      <span className="mt-0.5 text-base">{cents}</span>
    </span>
  );
}

function Home() {
  const { q = "", category = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  // `replace: true` so typing a search collapses into one history entry
  // instead of one per keystroke — a product Link still pushes a fresh
  // entry, so back from a product page returns here in a single step.
  const setQ = (next: string) => navigate({ search: (prev) => ({ ...prev, q: next || undefined }), replace: true });
  const setCategory = (next: string) =>
    navigate({ search: (prev) => ({ ...prev, category: next || undefined }), replace: true });
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["cats"], queryFn: () => listCategories() });
  const stats = useQuery({ queryKey: ["catalog-stats"], queryFn: () => getCatalogStats() });
  const products = useQuery({
    queryKey: ["products", q, category],
    queryFn: () => searchProducts({ data: { q, category } }),
  });
  // One batched query for every card's photo metadata instead of each
  // <ProductPhoto> card firing its own — see getProductPhotosMeta.
  const productIds = (products.data ?? []).map((p) => p.id);
  const photosMeta = useQuery({
    queryKey: ["product-photos-meta", productIds],
    queryFn: () => getProductPhotosMeta({ data: { productIds } }),
    enabled: productIds.length > 0,
    staleTime: 30_000,
  });
  // Tracks which product just got a confirmed "Added ✓" so the label can revert
  // after a moment — without this the button gave no sign the click registered.
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [addError, setAddError] = useState<{ id: number; message: string } | null>(null);
  const authErrorMessage = useAuthErrorMessage();
  const add = useMutation({
    mutationFn: (productId: number) => addToList({ data: { productId } }),
    onSuccess: (_data, productId) => {
      setAddError(null);
      qc.invalidateQueries({ queryKey: ["list"] });
      setJustAdded(productId);
      setTimeout(() => setJustAdded((cur) => (cur === productId ? null : cur)), 1500);
    },
    onError: (err, productId) => {
      setAddError({ id: productId, message: authErrorMessage(err, "Couldn't add that — try again.") });
    },
  });

  // The biggest real spread among whatever's currently loaded — featured as
  // the hero's shelf-tag callout instead of a made-up "deal of the day".
  // Memoized so typing in the search box or an add-to-list mutation doesn't
  // re-sort the whole result set on every render.
  const bestFind = useMemo(
    () =>
      (products.data ?? [])
        .filter((p) => p.min_price != null && p.max_price != null)
        .map((p) => ({ ...p, save: num(p.max_price) - num(p.min_price) }))
        .sort((a, b) => b.save - a.save)[0],
    [products.data],
  );

  return (
    <Shell>
      <div className="edge-torn -mx-4 mb-8 bg-navy px-4 py-2 md:mb-10">
        <p className="text-center font-mono text-[11px] font-semibold uppercase leading-snug tracking-wide text-highlight">
          ↳ this week's biggest price gaps, island-wide — someone is paying too much for this
        </p>
      </div>

      <section className="relative mb-9 md:mb-14 md:grid md:grid-cols-[1.25fr_1fr] md:items-end md:gap-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
            Curaçao{stats.data ? ` — ${stats.data.storeCount} stores, ${stats.data.productCount} staples tracked` : ""}
          </p>
          <h1 className="mt-1 font-display text-[2.4rem] leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Who's <span className="text-primary underline decoration-wavy decoration-[3px] underline-offset-4">cheapest</span>
            <br />
            today?
          </h1>
          <p className="mt-4 max-w-md text-[0.95rem] text-muted">
            Not an average, not an estimate from last year — actual shelf prices from Mangusa, Centrum,
            Van den Tweel, Carrefour, Goisco and the rest, checked against each other right now. See a
            price that's changed? Snap the receipt and it's in here for the next person within the hour.
          </p>
        </div>
        {bestFind && bestFind.save > 0.2 ? (
          <div className="sticker tilt-r relative mt-7 bg-highlight p-5 text-highlight-fg shadow-[5px_5px_0_var(--color-ink)] md:mt-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide">found this one today ↓</p>
            <p className="mt-1.5 truncate font-display text-lg leading-tight">{bestFind.name}</p>
            <div className="mt-1">
              <BigPrice amount={num(bestFind.min_price)} />
            </div>
            <p className="mt-1 font-mono text-sm font-semibold">
              at {bestFind.cheapest_store} — {xcg(bestFind.save)} less than the priciest store
            </p>
          </div>
        ) : null}
      </section>

      <div className="sticky top-14 z-10 -mx-4 mb-4 bg-bg/95 px-4 py-2 backdrop-blur-sm md:static md:mx-0 md:mb-5 md:bg-transparent md:px-0 md:py-0">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">▸</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="milk, rice, chicken…"
            className="h-12 w-full border-2 border-ink bg-surface pl-9 pr-4 text-base outline-none focus:border-primary"
          />
        </div>
      </div>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mb-8 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`h-9 shrink-0 border px-3.5 font-mono text-xs uppercase tracking-wide ${category === "" ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"}`}
        >
          All
        </button>
        {(cats.data ?? []).map((c) => (
          <button
            key={c.category}
            type="button"
            onClick={() => setCategory(c.category)}
            className={`h-9 shrink-0 border px-3.5 font-mono text-xs uppercase tracking-wide ${category === c.category ? "border-ink bg-ink text-bg" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"}`}
          >
            {c.category}
          </button>
        ))}
      </div>

      {products.isError ? (
        <p className="text-sm text-warn">Could not load the catalog. Refresh in a moment.</p>
      ) : products.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-md bg-line/60" />
          ))}
        </div>
      ) : (products.data ?? []).length === 0 ? (
        <div className="rounded-md border border-line bg-surface px-4 py-8 text-center">
          <p className="text-sm text-muted">
            {q.trim()
              ? `Nothing in the catalog matches “${q.trim()}”${category ? ` under ${category}` : ""}.`
              : `No products in ${category} yet.`}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="h-10 rounded-full border border-line px-4 text-sm text-ink"
              >
                Clear search
              </button>
            ) : null}
            {category ? (
              <button
                type="button"
                onClick={() => setCategory("")}
                className="h-10 rounded-full border border-line px-4 text-sm text-ink"
              >
                Show all categories
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data ?? []).map((p) => {
            // A product nobody has priced yet has min_price === null; num() would
            // turn that into 0 and the card would advertise it as free.
            const hasPrice = p.min_price != null;
            const min = num(p.min_price);
            const max = num(p.max_price);
            const save = hasPrice && max > min ? max - min : 0;
            return (
              <article key={p.id} className="overflow-hidden border border-line bg-surface transition-transform hover:-translate-y-0.5 hover:border-ink">
                <Link to="/products/$id" params={{ id: String(p.id) }} className="block no-underline">
                  <ProductPhoto
                    productId={p.id}
                    slug={p.slug}
                    name={p.name}
                    size="card"
                    photoMeta={photosMeta.data ? (photosMeta.data[p.id] ?? { contentType: null, uploadedAt: null }) : undefined}
                    imageUrl={p.image_url}
                  />
                </Link>
                <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/products/$id"
                      params={{ id: String(p.id) }}
                      className="font-medium text-ink no-underline hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <p className="truncate font-mono text-[11px] uppercase tracking-wide text-faint">
                      {p.category}
                      {p.brand ? ` · ${p.brand}` : ""} · {p.unit}
                    </p>
                  </div>
                  <div className="shrink-0 border-l-2 border-dotted border-line pl-3 text-right">
                    {hasPrice ? (
                      <>
                        <BigPrice amount={min} />
                        <div className="max-w-28 truncate font-mono text-[11px] text-muted">{p.cheapest_store}</div>
                      </>
                    ) : (
                      <div className="text-xs text-faint">no price yet</div>
                    )}
                  </div>
                </div>
                {save > 0.2 ? (
                  <p className="mt-2 inline-block -rotate-1 bg-good/15 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide text-good">
                    save {xcg(save)} vs. the priciest store
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/products/$id"
                    params={{ id: String(p.id) }}
                    className="inline-flex h-10 items-center border border-line px-3 text-sm text-ink no-underline hover:border-ink"
                  >
                    Compare
                  </Link>
                  {user ? (
                    <button
                      type="button"
                      disabled={(add.isPending && add.variables === p.id) || justAdded === p.id}
                      className="inline-flex h-10 items-center bg-primary px-3 text-sm font-medium text-primary-fg disabled:opacity-70"
                      onClick={() => {
                        setAddError(null);
                        add.mutate(p.id);
                      }}
                    >
                      {add.isPending && add.variables === p.id
                        ? "Adding…"
                        : justAdded === p.id
                          ? "Added ✓"
                          : "Add to list"}
                    </button>
                  ) : null}
                </div>
                {addError?.id === p.id ? (
                  <p role="alert" className="mt-2 text-xs text-warn">
                    {addError.message}
                  </p>
                ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
