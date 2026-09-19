import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/shell";
import { getCatalogStats, listStores } from "@/lib/server/catalog";
import { myReceipts, submitReceiptForReview } from "@/lib/server/receipts";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useAuthErrorMessage } from "@/lib/auth/mutation-error";
import { useRef, useState } from "react";

export const Route = createFileRoute("/contribute")({
  component: ContributePage,
  head: () => ({ meta: [{ title: "Update prices — Barata" }] }),
});

const RECEIPT_MAX_DIMENSION = 1600;
const RECEIPT_JPEG_QUALITY = 0.85;

/**
 * Downscales + re-encodes a photo to a JPEG data URL client-side before it goes
 * anywhere near the network. A real phone photo is typically 2-8 MB of raw
 * JPEG bytes, which base64 inflates by ~1.37x — comfortably past the server's
 * decoded-bytes cap and, for anything much past that, Vercel's ~4.5 MB
 * serverless request body limit. 1600px keeps receipt text legible for
 * whoever transcribes it while landing well under both ceilings.
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

const STATUS_LABEL: Record<string, string> = {
  awaiting_review: "Awaiting review",
  parsed: "Parsed",
  pending_review: "Prices pending approval",
  committed: "Live in catalog",
};

function ContributePage() {
  const { user, isPending } = useCurrentUserState();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => listStores() });
  const catalogStats = useQuery({ queryKey: ["catalog-stats"], queryFn: () => getCatalogStats() });
  const myRecent = useQuery({ queryKey: ["my-receipts"], queryFn: () => myReceipts(), enabled: Boolean(user) });
  const [text, setText] = useState("");
  const [storeId, setStoreId] = useState("mangusa-hyper");
  const [purchaseDate, setPurchaseDate] = useState<string>("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const authErrorMessage = useAuthErrorMessage();
  // `isPending` only flips on the next render, so two clicks in the same tick both get
  // through and we submit the same receipt twice. The ref closes that window.
  const submitting = useRef(false);
  const submit = useMutation({
    mutationFn: () => submitReceiptForReview({ data: { text, storeId, imageDataUrl, purchaseDate: purchaseDate || null } }),
    onSuccess: (res) => {
      if (!res.ok) {
        setSubmitError(res.error);
        return;
      }
      setSubmitError(null);
      setText("");
      setImageDataUrl(undefined);
      myRecent.refetch();
    },
    onError: (err) => {
      setSubmitError(authErrorMessage(err, "Could not submit that receipt — please try again."));
    },
    onSettled: () => {
      submitting.current = false;
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

  return (
    <Shell>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Update prices</h1>
      <p className="mt-2 max-w-xl text-sm text-muted md:text-base">
        Paste a receipt or type the lines, and/or attach a photo. An admin reads it, matches the items to the
        catalog, and reviews the prices before anything goes live — nothing is added to the public catalog
        automatically.
      </p>
      <p className="mt-3 max-w-xl rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
        The receipt text and photo you submit here are kept private and only used to read the line items off the
        receipt — see our{" "}
        <Link to="/privacy" className="text-ink underline underline-offset-2">
          Privacy policy
        </Link>{" "}
        for details.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (submitting.current) return;
            submitting.current = true;
            submit.mutate();
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
            <span className="mb-1 block text-muted">Purchase date (optional)</span>
            <input
              type="date"
              className="h-11 w-full rounded-xl border border-line bg-surface px-3"
              value={purchaseDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted">Receipt text (optional if you attach a photo)</span>
            <textarea
              className="min-h-48 w-full rounded-md border border-line bg-surface p-3 font-mono text-sm"
              placeholder={
                "Mangusa Hypermarket\nMelk 1L          3.15\nRijst 1kg        5.49\nKipfilet 1kg    11.20\nBananen 1kg      4.80\nEieren 12        6.25\nTOTAAL          30.89"
              }
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
            disabled={submit.isPending || (!text.trim() && !imageDataUrl)}
            className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60"
          >
            {submit.isPending ? "Submitting…" : "Submit for review"}
          </button>
          {submitError ? (
            <p role="alert" className="text-sm text-warn">
              {submitError}
            </p>
          ) : null}
          {submit.isSuccess && submit.data?.ok && !submitError ? (
            <p className="text-sm text-good">
              Thanks — receipt #{submit.data.receiptId} submitted. It'll show up in the catalog once someone reviews
              and approves the prices.
            </p>
          ) : null}
        </form>

        <div className="rounded-md border border-line bg-surface p-4">
          <h2 className="font-medium">Your recent submissions</h2>
          {!user ? null : myRecent.isLoading ? (
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-line/60" />
              ))}
            </div>
          ) : (myRecent.data ?? []).length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nothing submitted yet — your receipts will show up here.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(myRecent.data ?? []).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-sm">
                  <div>
                    <div>Receipt #{r.id}</div>
                    <div className="text-xs text-faint">
                      {new Date(r.created_at).toLocaleDateString()}
                      {r.has_photo ? " · with photo" : ""}
                    </div>
                  </div>
                  <span className="text-xs text-muted">{STATUS_LABEL[r.status] ?? r.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-faint">
        Catalog size: {catalogStats.data?.productCount ?? "—"} products.
      </p>
    </Shell>
  );
}
