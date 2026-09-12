import { productPhoto } from "@/lib/product-photo";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductPhotoMeta } from "@/lib/server/product-photos";

const LOGO_SIZE = { hero: "h-14 w-14", card: "h-10 w-10", thumb: "h-6 w-6" } as const;

export function ProductPhoto({
  productId,
  slug,
  name,
  size = "card",
}: {
  productId: number;
  slug: string;
  name: string;
  size?: "card" | "hero" | "thumb";
}) {
  // 0: try the real, admin-uploaded photo; 1: fall back to the curated stock-photo
  // map; 2: no accurate photo at all — show the Barata logo rather than guess.
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const box =
    size === "hero"
      ? "aspect-[4/3] w-full rounded-md md:aspect-square"
      : size === "thumb"
        ? "h-14 w-14 shrink-0 rounded-xl"
        : "aspect-[4/3] w-full rounded-none";

  // A <img> tag can't render a PDF, so on the product page (the only spot an admin
  // can upload one) check what was actually uploaded before deciding how to show it.
  // Catalog/list thumbnails skip this extra request — a raw PDF wouldn't read as a
  // useful thumbnail there anyway, so they just fall through to the stock photo.
  const meta = useQuery({
    queryKey: ["product-photo-meta", productId],
    queryFn: () => getProductPhotoMeta({ data: { productId } }),
    enabled: size === "hero",
    staleTime: 30_000,
  });

  // Once the real photo has 404'd (none uploaded yet) `stage` moves past 0 and
  // stays there — nothing else was retrying the real endpoint. Without this, a
  // fresh upload on THIS page never appears: the admin who just uploaded it
  // keeps seeing the stock photo / logo fallback they were already showing,
  // and has to reload the page to see their own upload took effect.
  const uploadedAt = meta.data?.uploadedAt ?? null;
  useEffect(() => {
    if (uploadedAt !== null) setStage(0);
  }, [uploadedAt]);

  if (size === "hero" && meta.isLoading) {
    return <div className={`animate-pulse bg-line/60 ${box}`} aria-hidden />;
  }

  if (size === "hero" && meta.data?.contentType === "application/pdf") {
    return (
      <a
        href={`/api/product-photo/${productId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col items-center justify-center gap-2 bg-primary/10 text-ink no-underline hover:bg-primary/15 ${box}`}
      >
        <span className="rounded bg-ink px-2 py-1 text-sm font-semibold text-bg">PDF</span>
        <span className="text-xs font-medium">View uploaded PDF</span>
      </a>
    );
  }

  const staticSrc = productPhoto(slug);
  // Cache-bust with the upload version when we have one (hero size only — see
  // above) so a re-upload shows immediately instead of serving the previous
  // photo out of the browser's HTTP cache for up to 5 minutes.
  const realSrc = `/api/product-photo/${productId}${uploadedAt !== null ? `?v=${uploadedAt}` : ""}`;
  const src = stage === 0 ? realSrc : stage === 1 ? staticSrc : undefined;

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 ${box}`} aria-hidden>
        <img src="/favicon.svg" alt="" className={`${LOGO_SIZE[size]} opacity-60`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-cover ${box}`}
      onError={() => setStage((s) => (s === 0 ? (staticSrc ? 1 : 2) : 2))}
    />
  );
}
