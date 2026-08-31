import { productPhoto } from "@/lib/product-photo";
import { useState } from "react";

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
      ? "aspect-[4/3] w-full rounded-2xl md:aspect-square"
      : size === "thumb"
        ? "h-14 w-14 shrink-0 rounded-xl"
        : "aspect-[4/3] w-full rounded-none";

  if (failed) {
    return (
      <div className={`bg-line/50 ${box}`} aria-hidden />
    );
  }

  return (
    <img
      src={productPhoto(slug)}
      alt={name}
      className={`object-cover ${box}`}
      onError={() => setFailed(true)}
    />
  );
}
