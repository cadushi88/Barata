import { productPhoto } from "@/lib/product-photo";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductPhotoMeta, type ProductPhotoMeta } from "@/lib/server/product-photos";

const LOGO_SIZE = { hero: "h-14 w-14", card: "h-10 w-10", thumb: "h-6 w-6" } as const;

export function ProductPhoto({
  productId,
  slug,
  name,
  size = "card",
  photoMeta,
  imageUrl,
}: {
  productId: number;
  slug: string;
  name: string;
  size?: "card" | "hero" | "thumb";
  /**
   * Pre-fetched photo metadata for this product, e.g. from a grid that batched
   * `getProductPhotosMeta` once for every card instead of letting each card fetch
   * its own via `getProductPhotoMeta`. When provided, this card skips its own
   * query entirely; when a product is known (from the batch) to have no photo,
   * it also skips ever trying the real photo endpoint, going straight to the
   * stock-photo/logo fallback instead of a request that would just 404.
   */
  photoMeta?: ProductPhotoMeta;
  /**
   * A real photo of this exact product found by the webshop scraper (`products.image_url`)
   * — a suggested source photo, not an admin upload. Tried after the admin upload but
   * before the generic curated stock photo, since a real photo of the actual product beats
   * a merely category-representative stock image.
   */
  imageUrl?: string | null;
}) {
  // 0: try the real, admin-uploaded photo; 1: a real scraped photo of this exact
  // product (imageUrl), if one was found; 2: fall back to the curated stock-photo
  // map; 3: no accurate photo at all — show the Barata logo rather than guess.
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
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
  // `photoMeta` supplied by a caller (a grid that already batched
  // `getProductPhotosMeta` for every card) skips this query entirely — only
  // fall back to fetching it ourselves when nobody handed us one.
  const metaQuery = useQuery({
    queryKey: ["product-photo-meta", productId],
    queryFn: () => getProductPhotoMeta({ data: { productId } }),
    enabled: size === "hero" && photoMeta === undefined,
    staleTime: 30_000,
  });
  const resolvedMeta = photoMeta !== undefined ? photoMeta : metaQuery.data;
  const metaIsLoading = photoMeta === undefined && metaQuery.isLoading;

  // Once the real photo has 404'd (none uploaded yet) `stage` moves past 0 and
  // stays there — nothing else was retrying the real endpoint. Without this, a
  // fresh upload on THIS page never appears: the admin who just uploaded it
  // keeps seeing the stock photo / logo fallback they were already showing,
  // and has to reload the page to see their own upload took effect.
  const uploadedAt = resolvedMeta?.uploadedAt ?? null;
  useEffect(() => {
    if (uploadedAt !== null) setStage(0);
  }, [uploadedAt]);

  // A batch already told us this product has no uploaded photo — skip straight
  // to the fallback chain instead of firing a real-photo request that would
  // just 404 (that 404 still costs a DB lookup server-side, once per card).
  const knownNoPhoto = photoMeta !== undefined && photoMeta.contentType === null;
  const staticSrc = productPhoto(slug);
  // Skip a stage entirely when it has nothing to try — e.g. no imageUrl means
  // stage 1 has no source, so both the initial render and onError should land
  // on the next stage that actually has something.
  const nextStage = (from: 0 | 1 | 2 | 3): 0 | 1 | 2 | 3 => {
    if (from <= 0 && imageUrl) return 1;
    if (from <= 1 && staticSrc) return 2;
    return 3;
  };
  const effectiveStage = knownNoPhoto && stage === 0 ? nextStage(0) : stage;

  if (size === "hero" && metaIsLoading) {
    return <div className={`animate-pulse bg-line/60 ${box}`} aria-hidden />;
  }

  if (size === "hero" && resolvedMeta?.contentType === "application/pdf") {
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

  // Cache-bust with the upload version when we have one (hero size, or a batch
  // that resolved one — see above) so a re-upload shows immediately instead of
  // serving the previous photo out of the browser's HTTP cache for up to 5 minutes.
  const realSrc = `/api/product-photo/${productId}${uploadedAt !== null ? `?v=${uploadedAt}` : ""}`;
  const src =
    effectiveStage === 0
      ? realSrc
      : effectiveStage === 1
        ? (imageUrl ?? undefined)
        : effectiveStage === 2
          ? staticSrc
          : undefined;

  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 ${box}`} aria-hidden>
        <img src="/favicon.png" alt="" className={`${LOGO_SIZE[size]} opacity-60`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-cover ${box}`}
      onError={() => setStage(nextStage(effectiveStage))}
    />
  );
}
