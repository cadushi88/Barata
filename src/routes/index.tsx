import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { listCategories, searchProducts, addToList } from "@/lib/server/catalog";
import { xcg, num } from "@/lib/money";
import { ProductPhoto } from "@/components/product-photo";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const { user } = useCurrentUserState();
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["cats"], queryFn: () => listCategories() });
  const products = useQuery({
    queryKey: ["products", q, category],
    queryFn: () => searchProducts({ data: { q, category } }),
  });
  const add = useMutation({
    mutationFn: (productId: number) => addToList({ data: { productId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["list"] }),
  });

  return (
    <Shell>
      <section className="mb-5 max-w-2xl md:mb-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">Curaçao · 12 stores · 80 staples</p>
        <h1 className="mt-2 font-display text-[1.85rem] font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
          Who is cheapest today?
        </h1>
        <p className="mt-3 hidden text-base text-muted sm:block">
          Compare grocery prices across Mangusa, Centrum, Van den Tweel, Carrefour, Goisco and more.
          Add a receipt and the catalog updates for everyone.
        </p>
      </section>

      <div className="sticky top-14 z-10 -mx-4 mb-3 bg-bg/95 px-4 py-2 backdrop-blur-sm md:static md:mx-0 md:mb-4 md:bg-transparent md:px-0 md:py-0">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search milk, rice, chicken…"
          className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base outline-none ring-primary/30 focus:ring-2"
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
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(products.data ?? []).map((p) => {
            const min = num(p.min_price);
            const max = num(p.max_price);
            const save = max > min ? max - min : 0;
            return (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
                <Link to="/products/$id" params={{ id: String(p.id) }} className="block no-underline">
                  <ProductPhoto slug={p.slug} name={p.name} size="card" />
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
                    <div className="font-medium tabular-nums">{xcg(min)}</div>
                    <div className="max-w-28 truncate text-xs text-muted">{p.cheapest_store}</div>
                  </div>
                </div>
                {save > 0.2 ? (
                  <p className="mt-2 text-xs text-good">
                    Spread {xcg(save)} vs the dearest store
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
                      className="inline-flex h-10 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-fg"
                      onClick={() => add.mutate(p.id)}
                    >
                      Add to list
                    </button>
                  ) : null}
                </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}
