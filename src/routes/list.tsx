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
  // Quantities matter: two litres of milk cost twice one litre, so the basket
  // comparison has to be told how many of each item the list holds.
  const items = (list.data ?? []).map((r) => ({ productId: r.id, qty: num(r.qty) > 0 ? num(r.qty) : 1 }));
  const basket = useQuery({
    queryKey: ["basket", items.map((i) => `${i.productId}x${i.qty}`).join(",")],
    queryFn: () => cheapestBasket({ data: { items } }),
    enabled: items.length > 0,
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
        <div className="h-32 animate-pulse rounded-md bg-line/60" />
      </Shell>
    );
  }
  if (!user) return <RedirectToSignIn />;

  const winner = basket.data?.stores[0];
  const winnerLines = winner?.lines.filter((l) => l.amount != null) ?? [];
  const winnerMissing = winner?.lines.filter((l) => l.amount == null) ?? [];
  // The top store isn't always a complete basket. Say what it can't supply rather than
  // quietly dropping those items from the order and quoting a total that doesn't cover them.
  const withQty = (l: { qty: number; name: string }) => `${l.qty > 1 ? `${l.qty} × ` : ""}${l.name.trim()}`;
  const whatsappText = winner
    ? encodeURIComponent(
        `Hi! I'd like to order these items from ${winner.store.name}:\n\n` +
          winnerLines.map(withQty).join("\n") +
          `\n\nTotal for those items (Barata estimate): ${xcg(winner.total)}` +
          (winnerMissing.length
            ? `\n\nI couldn't find a price for these, but please add them if you carry them:\n` +
              winnerMissing.map(withQty).join("\n")
            : "") +
          `\n\nCould you confirm availability and delivery? Thank you!`,
      )
    : "";

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
                  <ProductPhoto productId={it.id} slug={it.slug} name={it.name} size="thumb" />
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
                className={`rounded-md border p-4 ${i === 0 ? "border-primary bg-surface" : "border-line bg-surface"}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <Link to="/stores/$id" params={{ id: s.store.id }} className="font-medium text-ink no-underline">
                      {s.store.name}
                    </Link>
                    <div className="text-xs text-muted">{s.store.area}</div>
                  </div>
                  <div className="text-right">
                    {/* A store that stocks none of the basket has a total of 0, which
                        reads as "free" rather than "nothing to price here". */}
                    <div className="font-medium tabular-nums">
                      {s.missing === s.lines.length ? <span className="text-faint">No prices yet</span> : xcg(s.total)}
                    </div>
                    {s.missing ? (
                      <div className="text-xs text-warn">
                        {s.missing} {s.missing === 1 ? "item" : "items"} missing
                      </div>
                    ) : null}
                    {/* Only a store carrying every item has a comparable total — the others
                        are cheaper simply because they're ringing up fewer things. */}
                    {i === 0 && winner ? (
                      <div className={s.missing ? "text-xs text-warn" : "text-xs text-good"}>
                        {s.missing ? "Cheapest so far — but not a full basket" : "Best complete total"}
                      </div>
                    ) : null}
                  </div>
                </div>
                {i === 0 && winner ? (
                  <a
                    href={`https://wa.me/?text=${whatsappText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-good/10 px-4 text-sm font-medium text-good"
                  >
                    Request this order via WhatsApp →
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          {basket.data?.splitSavings && !basket.data.splitSavings.oneStopComplete ? (
            <div className="mt-6 rounded-md border border-line bg-surface p-4">
              <h3 className="font-medium">No single store stocks your whole list</h3>
              <p className="mt-1 text-sm text-muted">
                Every supermarket above is missing at least one item, so the totals cover different
                baskets and aren't directly comparable. Buying each item wherever it's cheapest would
                cost{" "}
                <span className="font-medium tabular-nums text-ink">
                  {xcg(basket.data.splitSavings.mixAndMatchTotal)}
                </span>{" "}
                across {basket.data.splitSavings.storeCount}{" "}
                {basket.data.splitSavings.storeCount === 1 ? "store" : "stores"}
                {basket.data.splitSavings.storeNames.length
                  ? ` (${basket.data.splitSavings.storeNames.join(", ")})`
                  : ""}
                .
              </p>
              <p className="mt-2 text-xs text-faint">
                Some items may simply have no price on record yet — adding a receipt on the Add tab
                fills those gaps for everyone.
              </p>
            </div>
          ) : basket.data?.splitSavings && basket.data.splitSavings.maxSavings > 0 ? (
            <div className="mt-6 rounded-md border border-line bg-surface p-4">
              <h3 className="font-medium">
                {basket.data.splitSavings.worthIt ? "Worth splitting your trip?" : "Splitting wouldn't really help"}
              </h3>
              <p className="mt-1 text-sm text-muted">
                Some items are cheaper elsewhere — like Mangusa having cheaper chicken even when Goisco wins overall.
                Buying every single item at whichever store has it cheapest would cost{" "}
                <span className="font-medium tabular-nums text-ink">{xcg(basket.data.splitSavings.mixAndMatchTotal)}</span>,
                a maximum possible saving of{" "}
                <span className="font-medium tabular-nums text-good">{xcg(basket.data.splitSavings.maxSavings)}</span> — but
                it means visiting {basket.data.splitSavings.storeCount}{" "}
                {basket.data.splitSavings.storeCount === 1 ? "store" : "different stores"}
                {basket.data.splitSavings.storeNames.length
                  ? ` (${basket.data.splitSavings.storeNames.join(", ")})`
                  : ""}
                {" "}instead of one.
              </p>
              <p className="mt-2 text-xs text-faint">
                {basket.data.splitSavings.worthIt
                  ? "That's a meaningful saving for a manageable number of stops — might be worth it if those stores are on your way."
                  : "The saving is small relative to the extra stops, or would take too many stores — for most people, the one-stop total above is the better call once you factor in time and fuel."}
              </p>
            </div>
          ) : null}
        </>
      )}
    </Shell>
  );
}
