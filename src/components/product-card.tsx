"use client";
/* eslint-disable @next/next/no-img-element -- LINK images must load directly and uploaded bytes must bypass image optimization. */
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="group block min-w-0" href={`/products/${product.id}`}>
      <ProductImage product={product} />
      <div className="space-y-1 pt-3">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-forest">{product.name}</h2>
        <strong className="money block text-base font-semibold text-forest">
          {product.variants.length
            ? `$${product.variants[0].priceUsd}`
            : "Unavailable"}
        </strong>
        <p className="text-sm text-sage">
          {product.reviewCount
            ? `★ ${product.ratingAverage} (${product.reviewCount})`
            : "No reviews yet"}
        </p>
      </div>
    </Link>
  );
}
export function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = product.images.find((i) => i.primary) ?? product.images[0];
  const src =
    image?.mode === "LINK"
      ? image.url
      : image?.mode === "UPLOAD"
        ? `/api/image?path=${encodeURIComponent(image.contentPath)}`
        : null;
  return (
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-md bg-[var(--surface-muted)] text-sm text-sage">
        {src && !failed ? (
          <img
            src={src}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            alt={image?.altText || product.name}
            onError={() => setFailed(true)}
          />
        ) : (
          <span aria-label="No product image">No image</span>
        )}
      </div>
  );
}
