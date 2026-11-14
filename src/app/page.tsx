import Link from "next/link";
import { api } from "@/lib/api";
import type { Page, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
type Category = { id: string; name: string };
export default async function Home() {
  const [products, categories] = await Promise.allSettled([
    api("/products?limit=8").then((r) => r.json() as Promise<Page<Product>>),
    api("/categories?limit=8").then((r) => r.json() as Promise<Page<Category>>),
  ]);
  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 lg:px-10">
      <section className="mb-14 grid overflow-hidden rounded-[2rem] bg-forest text-paper md:grid-cols-[1.2fr_0.8fr]">
        <div className="px-7 py-12 sm:px-12 sm:py-16">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#c8ddc9]">The independent marketplace</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Find something worth bringing home.</h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#e5eee4]">Browse products from independent sellers and build your cart.</p>
          <Link className="mt-8 inline-flex min-h-12 items-center rounded-full bg-paper px-6 font-semibold text-forest transition-colors hover:bg-[#e7efe5]" href="/products">
            Browse products
          </Link>
        </div>
        <div aria-hidden="true" className="hidden items-end justify-end bg-[#d9b897] p-10 md:flex"><span className="max-w-xs text-right text-4xl font-semibold leading-tight tracking-tight text-forest">Good things, found here.</span></div>
      </section>
      <section className="mb-14">
        <h2 className="mb-5 text-2xl font-semibold tracking-tight">Browse by category</h2>
        {categories.status === "fulfilled" ? (
          <div className="flex flex-wrap gap-3">
            {categories.value.items.length ? (
              categories.value.items.map((category) => (
                <Link
                  key={category.id}
                  className="rounded-full border border-line bg-paper px-5 py-3 text-sm font-semibold transition-colors hover:border-forest hover:text-forest"
                  href={`/products?categoryId=${category.id}`}
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <p>No categories yet.</p>
            )}
          </div>
        ) : (
          <p>Categories are unavailable right now.</p>
        )}
      </section>
      <section className="mb-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">Explore products</h2>
          <Link className="font-semibold text-forest underline underline-offset-4" href="/products">View all</Link>
        </div>
        {products.status === "fulfilled" ? (
          products.value.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.value.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>No products are available yet.</p>
          )
        ) : (
          <p>Products are unavailable right now. Refresh to retry.</p>
        )}
      </section>
    </main>
  );
}
