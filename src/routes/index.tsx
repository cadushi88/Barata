import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { listCategories, getCatalogStats, searchProducts, addToList } from "@/lib/server/catalog";
import { xcg, num, splitXcg } from "@/lib/money";
import { ProductPhoto } from "@/components/product-photo";
import { getProductPhotosMeta } from "@/lib/server/product-photos";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";

export const Route = createFileRoute("/")({
  component: Home,
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
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
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
  const bestFind = (products.data ?? [])
    .filter((p) => p.min_price != null && p.max_price != null)
    .map((p) => ({ ...p, save: num(p.max_price) - num(p.min_price) }))
    .sort((a, b) => b.save - a.save)[0];

  return (
    <Shell>
      <div
        className="-mx-4 mb-5 px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-primary-fg md:mb-6"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--color-primary) 0 18px, color-mix(in srgb, var(--color-primary) 80%, black) 18px 36px)",
        }}
      >
        This week — biggest spreads across every store on the island
      </div>

      <section className="mb-5 grid gap-5 md:mb-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            Curaçao{stats.data ? ` · ${stats.data.storeCount} stores · ${stats.data.productCount} staples` : ""}
          </p>
          <h1 className="mt-2 font-display text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
            Who is cheapest today?
          </h1>
          <p className="mt-3 hidden text-base text-muted sm:block">
            Compare grocery prices across Mangusa, Centrum, Van den Tweel, Carrefour, Goisco and more.
            Add a receipt and the catalog updates for everyone.
          </p>
        </div>
        {bestFind && bestFind.save > 0.2 ? (
          <div className="rounded-md bg-highlight p-5 text-highlight-fg">
            <p className="text-xs font-bold uppercase tracking-wide">This week's find</p>
            <p className="mt-1 truncate font-medium">{bestFind.name}</p>
            <div className="mt-1">
              <BigPrice amount={num(bestFind.min_price)} />
            </div>
            <p className="mt-1 text-sm font-medium">
              {bestFind.cheapest_store} — save {xcg(bestFind.save)}
            </p>
          </div>
        ) : null}
      </section>

      <div className="sticky top-14 z-10 -mx-4 mb-3 bg-bg/95 px-4 py-2 backdrop-blur-sm md:static md:mx-0 md:mb-4 md:bg-transparent md:px-0 md:py-0">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search milk, rice, chicken…"
          className="h-12 w-full rounded-md border border-line bg-surface px-4 text-base outline-none ring-primary/30 focus:ring-2"
        />
      </div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:mb-6 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`h-10 shrink-0 rounded-full px-4 text-sm ${category === "" ? "bg-ink text-bg" : "border border-line bg-surface text-muted"}`}
        >
          All
        </button>
        {(cats.data ?? []).map((c) => (
          <button
            key={c.category}
            type="button"
            onClick={() => setCategory(c.category)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${category === c.category ? "bg-ink text-bg" : "border border-line bg-surface text-muted"}`}
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
              <article key={p.id} className="overflow-hidden rounded-md border border-line bg-surface">
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
                    <p className="truncate text-xs text-faint">
                      {p.category}
                      {p.brand ? ` · ${p.brand}` : ""} · {p.unit}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {hasPrice ? (
                      <>
                        <BigPrice amount={min} />
                        <div className="max-w-28 truncate text-xs text-muted">{p.cheapest_store}</div>
                      </>
                    ) : (
                      <div className="text-xs text-faint">No price yet</div>
                    )}
                  </div>
                </div>
                {save > 0.2 ? (
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-good">
                    Save {xcg(save)} vs the most expensive store
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <Link
                    to="/products/$id"
                    params={{ id: String(p.id) }}
                    className="inline-flex h-10 items-center rounded-lg border border-line px-3 text-sm text-ink no-underline"
                  >
                    Compare
                  </Link>
                  {user ? (
                    <button
                      type="button"
                      disabled={(add.isPending && add.variables === p.id) || justAdded === p.id}
                      className="inline-flex h-10 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg disabled:opacity-70"
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
