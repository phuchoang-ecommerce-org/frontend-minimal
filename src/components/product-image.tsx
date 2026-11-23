"use client";
/* eslint-disable @next/next/no-img-element -- LINK images load directly and uploaded bytes bypass image optimization. */
import { useState } from "react";

export function ProductImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md bg-[var(--surface-muted)] text-sm text-sage">
      {src && !failed ? (
        <img
          src={src}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          alt={alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label="No product image">No image</span>
      )}
    </div>
  );
}
