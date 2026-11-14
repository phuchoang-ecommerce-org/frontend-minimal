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
    <main className="container">
      <section className="hero">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Find something worth bringing home.</h1>
          <p>Browse products from independent sellers and build your cart.</p>
          <Link className="primary-link" href="/products">
            Browse products
          </Link>
        </div>
      </section>
      <section>
        <h2>Categories</h2>
        {categories.status === "fulfilled" ? (
          <div className="category-list">
            {categories.value.items.length ? (
              categories.value.items.map((category) => (
                <Link
                  key={category.id}
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
      <section>
        <div className="section-heading">
          <h2>Explore products</h2>
          <Link href="/products">View all</Link>
        </div>
        {products.status === "fulfilled" ? (
          products.value.items.length ? (
            <div className="product-grid">
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
