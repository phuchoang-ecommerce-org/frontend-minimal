import Link from "next/link";
import { api } from "@/lib/api";
import type { Page, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Suspense } from "react";
type Category = { id: string; name: string };
export default function Home() {
  return (
    <main className="page-shell pb-20 pt-8 sm:pt-12">
      <section className="mb-16 grid items-end gap-8 border-b border-line pb-14 md:grid-cols-[minmax(0,1.3fr)_minmax(15rem,.7fr)] md:gap-12">
        <div>
          <p className="eyebrow mb-5">The independent marketplace</p>
          <h1 className="page-heading max-w-3xl">Find something worth bringing home.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-sage">Browse products from independent sellers and build your cart.</p>
          <Link className="button-primary mt-8" href="/products">
            Browse products
          </Link>
        </div>
        <div aria-hidden="true" className="hidden min-h-56 items-end justify-end border-l-4 border-clay bg-[var(--surface-muted)] p-8 md:flex"><span className="max-w-xs text-right text-3xl font-semibold leading-tight tracking-tight text-forest">Good things, found here.</span></div>
      </section>
      <section className="mb-16">
        <h2 className="section-heading mb-5">Browse by category</h2>
        <Suspense fallback={<p>Loading categories…</p>}><Categories /></Suspense>
      </section>
      <section className="mb-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="section-heading">Explore products</h2>
          <Link className="font-semibold text-forest underline underline-offset-4" href="/products">View all</Link>
        </div>
        <Suspense fallback={<p>Loading products…</p>}><FeaturedProducts /></Suspense>
      </section>
    </main>
  );
}

async function Categories() {
  const categories = await api("/categories?limit=8").then((response) => response.json() as Promise<Page<Category>>).catch(() => null);
  if (!categories) return <p>Categories are unavailable right now.</p>;
  return (
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-3">
            {categories.items.length ? (
              categories.items.map((category) => (
                <Link
                  key={category.id}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-ink hover:text-forest hover:underline hover:underline-offset-4"
                  href={`/products?categoryId=${category.id}`}
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <p>No categories yet.</p>
            )}
          </div>
  );
}

async function FeaturedProducts() {
  const products = await api("/products?limit=8").then((response) => response.json() as Promise<Page<Product>>).catch(() => null);
  if (!products) return <p>Products are unavailable right now. Refresh to retry.</p>;
  return products.items.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 lg:grid-cols-4">
              {products.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>No products are available yet.</p>
          );
}
