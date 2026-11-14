import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Page, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const name of ["q", "categoryId", "minPrice", "maxPrice", "cursor"]) {
    const value = params[name];
    if (typeof value === "string" && value) query.set(name, value);
  }
  query.set("limit", "20");
  let page: Page<Product> | null = null;
  let error = "";
  try {
    page = await (await api(`/products?${query}`)).json();
  } catch (e) {
    error =
      e instanceof ApiError && e.problem.code === "INVALID_CURSOR"
        ? "This page expired. Clear the page cursor and try again."
        : "Products are unavailable right now.";
  }
  const next = new URLSearchParams(query);
  if (page?.nextCursor) next.set("cursor", page.nextCursor);
  return (
    <main className="container">
      <h1>Products</h1>
      <form className="filters" action="/products">
        <label>
          Search{" "}
          <input
            name="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
          />
        </label>
        <label>
          Minimum USD{" "}
          <input
            name="minPrice"
            placeholder="0.00"
            defaultValue={
              typeof params.minPrice === "string" ? params.minPrice : ""
            }
          />
        </label>
        <label>
          Maximum USD{" "}
          <input
            name="maxPrice"
            placeholder="100.00"
            defaultValue={
              typeof params.maxPrice === "string" ? params.maxPrice : ""
            }
          />
        </label>
        {typeof params.categoryId === "string" && (
          <input type="hidden" name="categoryId" value={params.categoryId} />
        )}
        <button type="submit">Apply filters</button>
      </form>
      {error && (
        <p role="alert">
          {error} <Link href="/products">Start again</Link>
        </p>
      )}
      {page &&
        (page.items.length ? (
          <div className="product-grid">
            {page.items.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        ) : (
          <p>No matching products.</p>
        ))}
      {page?.hasNext && (
        <p>
          <Link href={`/products?${next}`}>Next page</Link>
        </p>
      )}
    </main>
  );
}
