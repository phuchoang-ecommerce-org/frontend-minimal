import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/add-to-cart";
export default async function ProductDetail({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  let product: Product;
  try {
    product = await (
      await api(`/products/${encodeURIComponent(productId)}`)
    ).json();
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  return (
    <main className="container">
      <h1>{product.name}</h1>
      <div className="detail-grid">
        <ProductCard product={product} />
        <div className="panel">
          <p>{product.description}</p>
          <p>
            {product.reviewCount
              ? `★ ${product.ratingAverage} from ${product.reviewCount} reviews`
              : "No reviews yet"}
          </p>
          <AddToCart variants={product.variants} />
        </div>
      </div>
    </main>
  );
}
