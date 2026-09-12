import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { listStores, searchProducts } from "@/lib/server/catalog";
import { commitReceipt, parseReceipt } from "@/lib/server/receipts";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useRef, useState } from "react";
import { xcg } from "@/lib/money";

export const Route = createFileRoute("/contribute")({ component: ContributePage });

const RECEIPT_MAX_DIMENSION = 1600;
const RECEIPT_JPEG_QUALITY = 0.85;

/**
 * Downscales + re-encodes a photo to a JPEG data URL client-side before it goes
 * anywhere near the network. A real phone photo is typically 2-8 MB of raw
 * JPEG bytes, which base64 inflates by ~1.37x — comfortably past both
 * `parseReceipt`'s 2.5 MB `imageDataUrl` cap and, for anything much past
 * ~3.3 MB raw, Vercel's ~4.5 MB serverless request body limit. Reading the
 * file with `FileReader.readAsDataURL` untouched (as this route used to)
 * means the request either fails Zod validation or gets rejected by the
 * platform before `parseReceipt` ever runs — indistinguishable, to whoever
 * hit it, from "the AI doesn't work". 1600px keeps receipt text legible for
 * the model while landing well under both ceilings.
 */
function compressReceiptImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, RECEIPT_MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", RECEIPT_JPEG_QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function ContributePage() {
  const { user, isPending } = useCurrentUserState();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  const catalog = useQuery({ queryKey: ["products", "", ""], queryFn: () => searchProducts({ data: { q: "", category: "" } }) });
  const [text, setText] = useState(
    "Mangusa Hypermarket\nMelk 1L          3.15\nRijst 1kg        5.49\nKipfilet 1kg    11.20\nBananen 1kg      4.80\nEieren 12        6.25\nTOTAAL          30.89",
  );
  const [storeId, setStoreId] = useState("mangusa-hyper");
  const [storeManuallySet, setStoreManuallySet] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageError, setImageError] = useState<string | null>(null);
  // `isPending` only flips on the next render, so two clicks in the same tick both get
  // through and we parse (and store) the same receipt twice. The ref closes that window.
  const parsing = useRef(false);
  const parse = useMutation({
    mutationFn: () => parseReceipt({ data: { text, storeId, imageDataUrl } }),
    onSuccess: (res) => {
      if (!res.ok) return;
      // Only auto-apply the AI's detected store if the user hasn't already picked one themselves.
      if (!storeManuallySet && res.detectedStoreId) setStoreId(res.detectedStoreId);
      if (res.purchaseDate) setPurchaseDate(res.purchaseDate);
    },
    onSettled: () => {
      parsing.current = false;
    },
  });
  const commit = useMutation({
    mutationFn: () => {
      const items = (parse.data && parse.data.ok ? parse.data.items : [])
        .filter((i) => i.productId)
        .map((i) => ({ productId: i.productId as number, amount: i.amount }));
      const receiptId = parse.data && parse.data.ok ? parse.data.receiptId : 0;
      return commitReceipt({ data: { receiptId: receiptId ?? 0, storeId, items, purchaseDate: purchaseDate || null } });
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

  const parsed = parse.data && parse.data.ok ? parse.data : null;

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Update prices</h1>
      <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
        Paste a receipt or type the lines. Claude reads the items, sorts them by category and price, and matches them to the catalog.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (parsing.current) return;
            parsing.current = true;
            parse.mutate();
          }}
        >
          <label className="block text-sm">
            <span className="mb-1 block text-muted">
              Store
              {parsed && parse.data?.ok && parse.data.detectedStoreId ? (
                <span className="ml-2 text-xs text-faint">
                  AI detected · {Math.round((parse.data.storeConfidence ?? 0) * 100)}% match
                </span>
              ) : null}
            </span>
            <select
              className="h-11 w-full rounded-xl border border-line bg-surface px-3"
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value);
                setStoreManuallySet(true);
              }}
            >
              {(stores.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Purchase date {purchaseDate ? "" : "(not detected — enter manually)"}</span>
            <input
              type="date"
              className="h-11 w-full rounded-xl border border-line bg-surface px-3"
              value={purchaseDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Receipt text</span>
            <textarea
              className="min-h-48 w-full rounded-md border border-line bg-surface p-3 font-mono text-sm"
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
                setImageError(null);
                if (!f) {
                  setImageDataUrl(undefined);
                  return;
                }
                compressReceiptImage(f)
                  .then(setImageDataUrl)
                  .catch(() => {
                    setImageDataUrl(undefined);
                    setImageError("That photo couldn't be read — try a different one.");
                  });
              }}
            />
          </label>
          {imageError ? <p className="text-sm text-warn">{imageError}</p> : null}
          <button
            type="submit"
            disabled={parse.isPending}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60"
          >
            {parse.isPending ? "Reading receipt…" : "Read with AI"}
          </button>
          {parse.data && !parse.data.ok ? <p className="text-sm text-warn">{parse.data.error}</p> : null}
          {/* A throw (e.g. receipt text past the 20 000-character server limit) leaves
              `data` undefined, so without this the button click did nothing at all. */}
          {parse.isError ? (
            <p className="text-sm text-warn">
              Could not read that receipt
              {text.length > 20000 ? " — it is too long, try splitting it up" : ", please try again"}.
            </p>
          ) : null}
        </form>

        <div className="rounded-md border border-line bg-surface p-4">
          <h2 className="font-medium">Sorted items</h2>
          {!parsed ? (
            <p className="mt-2 text-sm text-muted">Results appear here, grouped by type.</p>
          ) : (
            <>
              {parse.data?.ok && parse.data.isStale ? (
                <p className="mb-3 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">
                  This receipt is over a year old — treat its prices as historical, not current.
                </p>
              ) : null}
              <ul className="mt-3 space-y-2">
                {parsed.items.map((it, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <div>{it.name}</div>
                      <div className="text-xs text-faint">
                        {it.category}
                        {it.matchedName ? ` · matched ${it.matchedName}` : " · unmatched"}
                        {it.isWeighed ? " · priced per kg" : ""}
                        {it.missingUnitPrice ? " · sold by weight, no per-kg price on the line — not published" : ""}
                      </div>
                    </div>
                    <div className="tabular-nums">
                      {xcg(it.amount)}
                      {it.isWeighed ? <span className="text-xs text-faint">/kg</span> : null}
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-4 h-11 rounded-xl bg-ink px-4 text-sm text-bg disabled:opacity-50"
                disabled={commit.isPending || !parsed.items.some((i) => i.productId)}
                onClick={() => commit.mutate()}
              >
                {commit.isPending ? "Saving…" : "Submit matched prices"}
              </button>
              {commit.data && commit.data.ok ? (
                <p className="mt-2 text-sm text-good">
                  Submitted {commit.data.n} price{commit.data.n === 1 ? "" : "s"} for review — they'll appear in the
                  catalog once approved.
                </p>
              ) : null}
              {/* Publishing could fail silently: a rejected purchase date or a receipt the
                  server won't accept left the button looking like it had done nothing. */}
              {commit.data && !commit.data.ok ? (
                <p className="mt-2 text-sm text-warn">{commit.data.error}</p>
              ) : null}
              {commit.isError ? (
                <p className="mt-2 text-sm text-warn">Could not submit these prices. Please try again.</p>
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
