"use client";
/* eslint-disable @next/next/no-img-element -- LINK images must load directly and uploaded bytes must bypass image optimization. */
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
export function ProductCard({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const image = product.images.find((i) => i.primary) ?? product.images[0];
  const src =
    image?.mode === "LINK"
      ? image.url
      : image?.mode === "UPLOAD"
        ? `/api/image?path=${encodeURIComponent(image.contentPath)}`
        : null;
  return (
    <Link className="group overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:-translate-y-1 hover:border-forest/40 hover:shadow-lg" href={`/products/${product.id}`}>
      <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#e8e9df] text-sm text-sage">
        {src && !failed ? (
          <img
            src={src}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={image?.altText || product.name}
            onError={() => setFailed(true)}
          />
        ) : (
          <span aria-label="No product image">No image</span>
        )}
      </div>
      <div className="space-y-2 p-5">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug">{product.name}</h2>
        <strong className="block text-lg text-forest">
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
