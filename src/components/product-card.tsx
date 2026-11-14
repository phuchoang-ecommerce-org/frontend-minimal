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
    <Link className="product-card" href={`/products/${product.id}`}>
      <div className="product-image">
        {src && !failed ? (
          <img
            src={src}
            alt={image?.altText || product.name}
            onError={() => setFailed(true)}
          />
        ) : (
          <span aria-label="No product image">No image</span>
        )}
      </div>
      <div className="product-card-body">
        <h2>{product.name}</h2>
        <p className="muted">Seller {product.sellerId.slice(0, 8)}</p>
        <strong>
          {product.variants.length
            ? `$${product.variants[0].priceUsd}`
            : "Unavailable"}
        </strong>
        <p className="muted">
          {product.reviewCount
            ? `★ ${product.ratingAverage} (${product.reviewCount})`
            : "No reviews yet"}
        </p>
      </div>
    </Link>
  );
}
