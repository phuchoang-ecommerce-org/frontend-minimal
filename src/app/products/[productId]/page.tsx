import { notFound } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product-card";
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
    <main className="page-shell py-10 sm:py-14">
      <Link className="mb-6 inline-block text-sm font-semibold text-forest underline underline-offset-4" href="/products">← All products</Link>
      <h1 className="page-heading mb-8 max-w-3xl">{product.name}</h1>
      <div className="grid gap-10 md:grid-cols-[minmax(260px,480px)_minmax(0,1fr)] lg:gap-16">
        <ProductImage product={product} />
        <div className="h-fit border-t border-line pt-6">
          <p className="money text-2xl font-semibold text-forest">{product.variants.length ? `$${product.variants[0].priceUsd}` : "Unavailable"}</p>
          <p className="mt-5 max-w-prose leading-relaxed">{product.description}</p>
          <p className="my-6 text-sm text-sage">
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
