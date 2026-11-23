import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductImage as ImageFallback } from "./product-image";
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
  const image = product.images.find((item) => item.primary) ?? product.images[0];
  const src = image?.mode === "LINK" ? image.url : image?.mode === "UPLOAD"
    ? `/api/image?path=${encodeURIComponent(image.contentPath)}` : null;
  return <ImageFallback src={src} alt={image?.altText || product.name} />;
}
