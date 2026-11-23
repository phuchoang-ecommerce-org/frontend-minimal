import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Page, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Suspense } from "react";

type Category = { id: string; name: string };

async function allCategories(): Promise<Category[]> {
  const categories: Category[] = [];
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const page = await (await api(`/categories?${query}`)).json() as Page<Category>;
    categories.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);
  return categories;
}

export default async function Products({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : "";
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="page-shell py-10 sm:py-14">
      <div className="mb-10"><p className="eyebrow mb-2">The collection</p><h1 className="page-heading">Products</h1></div>
      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        <aside className="self-start border-t border-line pt-5" aria-label="Product filters">
          <h2 className="mb-4 text-base font-semibold">Filter products</h2>
          <Suspense fallback={<p>Loading filters…</p>}><CategoryFilter q={q} categoryId={categoryId} /></Suspense>
        </aside>
        <section aria-label="Product results">
          <Suspense fallback={<p>Loading products…</p>}><ProductResults q={q} categoryId={categoryId} cursor={cursor} back={back} /></Suspense>
        </section>
      </div>
    </main>
  );
}

async function CategoryFilter({ q, categoryId }: { q: string; categoryId: string }) {
  const categories = await allCategories().catch(() => null);
  return <>
          {categories ? (
            <form action="/products" className="grid gap-4">
              {q && <input type="hidden" name="q" value={q} />}
              <label className="text-sm font-semibold" htmlFor="category-filter">Category</label>
              <select id="category-filter" name="categoryId" defaultValue={categoryId} className="min-h-11 w-full rounded-md border border-line bg-paper px-3 text-base font-normal focus:border-forest">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <button className="button-secondary" type="submit">Apply filter</button>
            </form>
          ) : <p className="text-sm text-sage" role="status">Categories are unavailable. Refresh to try again.</p>}
  </>;
}

async function ProductResults({ q, categoryId, cursor, back }: { q: string; categoryId: string; cursor: string; back: string[] }) {
  const query = new URLSearchParams({ limit: "20" });
  if (q) query.set("q", q);
  if (categoryId) query.set("categoryId", categoryId);
  if (cursor) query.set("cursor", cursor);
  const productResult = await api(`/products?${query}`).then((response) => response.json() as Promise<Page<Product>>).then(
    (value) => ({ page: value, error: "" }),
    (reason: unknown) => ({ page: null, error: reason instanceof ApiError && reason.problem.code === "INVALID_CURSOR"
      ? "This page expired. Start again from the first page." : "Products are unavailable right now." }),
  );
  const { page, error } = productResult;
  const base = new URLSearchParams();
  if (q) base.set("q", q);
  if (categoryId) base.set("categoryId", categoryId);
  const next = new URLSearchParams(base);
  for (const prior of back) next.append("back", prior);
  next.append("back", cursor || "start");
  if (page?.nextCursor) next.set("cursor", page.nextCursor);
  const previous = new URLSearchParams(base);
  for (const prior of back.slice(0, -1)) previous.append("back", prior);
  const previousCursor = back.at(-1);
  if (previousCursor && previousCursor !== "start") previous.set("cursor", previousCursor);
  return <>
          {error && <p className="notice-error mb-5" role="alert">{error} <Link className="underline" href={`/products?${base}`}>Start again</Link></p>}
          {page && (page.items.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 xl:grid-cols-3">
              {page.items.map((product) => <ProductCard product={product} key={product.id} />)}
            </div>
          ) : <p className="border-t border-line py-8 text-sage">No matching products.</p>)}
          {page && (back.length > 0 || page.hasNext) && <nav aria-label="Product pages" className="mt-8 flex flex-wrap justify-center gap-3">
            {back.length > 0 && <Link className="button-secondary" href={`/products?${previous}`}>Previous page</Link>}
            {page.hasNext && page.nextCursor && <Link className="button-secondary" href={`/products?${next}`}>Next page</Link>}
          </nav>}
  </>;
}
