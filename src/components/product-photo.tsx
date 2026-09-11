import { productPhoto } from "@/lib/product-photo";
import { useState } from "react";

const LOGO_SIZE = { hero: "h-14 w-14", card: "h-10 w-10", thumb: "h-6 w-6" } as const;

export function ProductPhoto({
  slug,
  name,
  size = "card",
}: {
  slug: string;
  name: string;
  size?: "card" | "hero" | "thumb";
}) {
  const [failed, setFailed] = useState(false);
  const box =
    size === "hero"
      ? "aspect-[4/3] w-full rounded-md md:aspect-square"
      : size === "thumb"
        ? "h-14 w-14 shrink-0 rounded-xl"
        : "aspect-[4/3] w-full rounded-none";

  const src = productPhoto(slug);

  // No accurate photo of this product (or the real one failed to load) - show
  // the Barata logo rather than guess with an unrelated stock photo.
  if (failed || !src) {
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
      onError={() => setFailed(true)}
    />
  );
}
