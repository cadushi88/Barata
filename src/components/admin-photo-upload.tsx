import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadProductPhoto } from "@/lib/server/product-photos";

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

/** Downscales + re-encodes an image file to a small JPEG data URL client-side, so a 5-10 MB phone photo never has to travel over the wire (or sit in the DB) at full size. */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** PDFs aren't re-encoded client-side (nothing to downscale) — just read as-is. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

type Preview = { kind: "image"; url: string } | { kind: "pdf"; name: string };

export function AdminPhotoUpload({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: (dataUrl: string) => uploadProductPhoto({ data: { productId, dataUrl } }),
    onSuccess: (res) => {
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["product-photo-meta", productId] });
        // The <img> tag's src doesn't change on re-upload, so a browser cache would
        // otherwise keep showing the old photo — force a fresh fetch.
        qc.invalidateQueries({ queryKey: ["product-photo-nonce", productId] });
      }
    },
  });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setReadError(null);
    try {
      const isPdf = file.type === "application/pdf";
      const dataUrl = isPdf ? await readAsDataUrl(file) : await compressImage(file);
      setPreview(isPdf ? { kind: "pdf", name: file.name } : { kind: "image", url: dataUrl });
      upload.mutate(dataUrl);
    } catch {
      // A file that's neither a decodable image nor a PDF (compressImage's <img>
      // fails to load it) rejects here — without a message, that was a silent
      // failure too: the click handler just did nothing.
      setReadError("That file couldn't be read — choose an image or a PDF.");
    }
  }

  return (
    <div className="rounded-md border border-dashed border-line bg-surface/60 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">Admin: product photo or PDF</p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="h-9 rounded-lg bg-ink px-3 text-xs font-medium text-bg"
          onClick={() => cameraInputRef.current?.click()}
        >
          Take photo
        </button>
        <button
          type="button"
          className="h-9 rounded-lg border border-line px-3 text-xs font-medium text-ink"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose file
        </button>
        {upload.isPending ? <span className="text-xs text-muted">Uploading…</span> : null}
        {upload.data?.ok ? <span className="text-xs text-good">Saved</span> : null}
        {upload.data && !upload.data.ok ? <span className="text-xs text-warn">{upload.data.error}</span> : null}
        {/* A thrown error (expired session, a request the platform itself rejected as
            too large, a dropped connection) rejects the mutation instead of resolving
            with { ok: false } — without this branch that case showed nothing at all. */}
        {upload.isError ? <span className="text-xs text-warn">Upload failed — try again</span> : null}
        {readError ? <span className="text-xs text-warn">{readError}</span> : null}
      </div>
      {/* `capture` on this one hints the browser to open the camera directly rather than a file/photo picker — cameras only produce photos, so this input stays image-only. */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {preview?.kind === "image" ? (
        <img src={preview.url} alt="" className="mt-3 h-24 w-24 rounded-md object-cover" />
      ) : null}
      {preview?.kind === "pdf" ? (
        <div className="mt-3 flex max-w-xs items-center gap-2 rounded-md border border-line bg-bg px-3 py-2 text-xs">
          <span className="shrink-0 rounded bg-ink px-1.5 py-0.5 font-semibold text-bg">PDF</span>
          <span className="truncate text-muted">{preview.name}</span>
        </div>
      ) : null}
    </div>
  );
}
