import { notFound } from "next/navigation";
import Link from "next/link";
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
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <Link className="mb-6 inline-block text-sm font-semibold text-forest underline underline-offset-4" href="/products">← All products</Link>
      <h1 className="mb-8 max-w-3xl text-4xl font-semibold tracking-tight">{product.name}</h1>
      <div className="grid gap-8 md:grid-cols-[minmax(260px,420px)_1fr]">
        <ProductCard product={product} />
        <div className="h-fit rounded-2xl border border-line bg-paper p-6 sm:p-8">
          <p className="max-w-prose leading-relaxed">{product.description}</p>
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
