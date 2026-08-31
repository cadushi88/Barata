import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { listStores, searchProducts } from "@/lib/server/catalog";
import { commitReceipt, parseReceipt } from "@/lib/server/receipts";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useState } from "react";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/contribute")({ component: ContributePage });

function ContributePage() {
  const { user, isPending } = useCurrentUserState();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  const catalog = useQuery({ queryKey: ["products", "", ""], queryFn: () => searchProducts({ data: { q: "", category: "" } }) });
  const [text, setText] = useState(
    "Mangusa Hypermarket\nMelk 1L          3.15\nRijst 1kg        5.49\nKipfilet 1kg    11.20\nBananen 1kg      4.80\nEieren 12        6.25\nTOTAAL          30.89",
  );
  const [storeId, setStoreId] = useState("mangusa-hyper");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const parse = useMutation({
    mutationFn: () => parseReceipt({ data: { text, storeId, imageDataUrl } }),
  });
  const commit = useMutation({
    mutationFn: () => {
      const items = (parse.data && parse.data.ok ? parse.data.items : [])
        .filter((i) => i.productId)
        .map((i) => ({ productId: i.productId as number, amount: i.amount }));
      const receiptId = parse.data && parse.data.ok ? parse.data.receiptId : 0;
      return commitReceipt({ data: { receiptId: receiptId ?? 0, storeId, items } });
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

  const parsed = parse.data && parse.data.ok ? parse.data : null;

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Update prices</h1>
      <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
        Paste a receipt or type the lines. Grok reads the items, sorts them by category and price, and matches them to the catalog.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            parse.mutate();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Store</span>
            <select
              className="h-11 w-full rounded-xl border border-line bg-surface px-3"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
            >
              {(stores.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Receipt text</span>
            <textarea
              className="min-h-48 w-full rounded-2xl border border-line bg-surface p-3 font-mono text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          <label className="block text-sm text-muted">
            Optional photo
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) {
                  setImageDataUrl(undefined);
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setImageDataUrl(String(reader.result));
                reader.readAsDataURL(f);
              }}
            />
          </label>
          <button
            type="submit"
            disabled={parse.isPending}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60"
          >
            {parse.isPending ? "Reading receipt…" : "Read with AI"}
          </button>
          {parse.data && !parse.data.ok ? <p className="text-sm text-warn">{parse.data.error}</p> : null}
        </form>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <h2 className="font-medium">Sorted items</h2>
          {!parsed ? (
            <p className="mt-2 text-sm text-muted">Results appear here, grouped by type.</p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {parsed.items.map((it, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <div>{it.name}</div>
                      <div className="text-xs text-faint">
                        {it.category}
                        {it.matchedName ? ` · matched ${it.matchedName}` : " · unmatched"}
                      </div>
                    </div>
                    <div className="tabular-nums">{xcg(it.amount)}</div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 h-11 rounded-xl bg-ink px-4 text-sm text-bg disabled:opacity-50"
                disabled={commit.isPending || !parsed.items.some((i) => i.productId)}
                onClick={() => commit.mutate()}
              >
                {commit.isPending ? "Saving…" : "Publish matched prices"}
              </button>
              {commit.data && commit.data.ok ? (
                <p className="mt-2 text-sm text-good">Published {commit.data.n} prices to the public catalog.</p>
              ) : null}
            </>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-faint">
        Catalog size: {(catalog.data ?? []).length} products. Unmatched lines stay private until a human maps them.
      </p>
    </Shell>
  );
}
