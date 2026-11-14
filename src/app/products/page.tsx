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
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest">The collection</p><h1 className="text-4xl font-semibold tracking-tight">Products</h1></div>
      <form className="mb-8 grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end" action="/products">
        <label className="grid gap-2 text-sm font-semibold">
          Search{" "}
          <input
            className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal focus:border-forest"
            name="q"
            defaultValue={typeof params.q === "string" ? params.q : ""}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Minimum USD{" "}
          <input
            className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal focus:border-forest"
            name="minPrice"
            placeholder="0.00"
            defaultValue={
              typeof params.minPrice === "string" ? params.minPrice : ""
            }
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Maximum USD{" "}
          <input
            className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal focus:border-forest"
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
        <button className="min-h-11 rounded-lg bg-forest px-5 font-semibold text-white hover:bg-ink" type="submit">Apply filters</button>
      </form>
      {error && (
        <p className="mb-5 rounded-xl border border-clay bg-[#fff4e9] p-4" role="alert">
          {error} <Link href="/products">Start again</Link>
        </p>
      )}
      {page &&
        (page.items.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {page.items.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-line bg-paper p-8 text-sage">No matching products.</p>
        ))}
      {page?.hasNext && (
        <p className="mt-8 text-center">
          <Link className="inline-flex rounded-full border border-forest px-6 py-3 font-semibold text-forest hover:bg-forest hover:text-white" href={`/products?${next}`}>Next page</Link>
        </p>
      )}
    </main>
  );
}
