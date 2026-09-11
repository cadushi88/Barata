import { productPhoto } from "@/lib/product-photo";
import { useState } from "react";

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

  const staticSrc = productPhoto(slug);
  const src = stage === 0 ? `/api/product-photo/${productId}` : stage === 1 ? staticSrc : undefined;

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
