import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import type { Page, Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";

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
  const query = new URLSearchParams({ limit: "20" });
  if (q) query.set("q", q);
  if (categoryId) query.set("categoryId", categoryId);
  if (cursor) query.set("cursor", cursor);

  const [productResult, categoryResult] = await Promise.allSettled([
    api(`/products?${query}`).then((response) => response.json() as Promise<Page<Product>>),
    allCategories(),
  ]);
  const page = productResult.status === "fulfilled" ? productResult.value : null;
  const error = productResult.status === "rejected"
    ? productResult.reason instanceof ApiError && productResult.reason.problem.code === "INVALID_CURSOR"
      ? "This page expired. Start again from the first page."
      : "Products are unavailable right now."
    : "";
  const categories = categoryResult.status === "fulfilled" ? categoryResult.value : null;
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

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest">The collection</p><h1 className="text-4xl font-semibold tracking-tight">Products</h1></div>
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="self-start rounded-2xl border border-line bg-paper p-5" aria-label="Product filters">
          <h2 className="mb-4 text-lg font-semibold">Filter products</h2>
          {categories ? (
            <form action="/products" className="grid gap-4">
              {q && <input type="hidden" name="q" value={q} />}
              <label className="text-sm font-semibold" htmlFor="category-filter">Category</label>
              <select id="category-filter" name="categoryId" defaultValue={categoryId} className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-base font-normal focus:border-forest">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <button className="min-h-11 rounded-lg bg-forest px-5 font-semibold text-white hover:bg-ink" type="submit">Apply filter</button>
            </form>
          ) : <p className="text-sm text-sage" role="status">Categories are unavailable. Refresh to try again.</p>}
        </aside>
        <section aria-label="Product results">
          {error && <p className="mb-5 rounded-xl border border-clay bg-[#fff4e9] p-4" role="alert">{error} <Link className="underline" href={`/products?${base}`}>Start again</Link></p>}
          {page && (page.items.length ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {page.items.map((product) => <ProductCard product={product} key={product.id} />)}
            </div>
          ) : <p className="rounded-2xl border border-line bg-paper p-8 text-sage">No matching products.</p>)}
          {page && (back.length > 0 || page.hasNext) && <nav aria-label="Product pages" className="mt-8 flex flex-wrap justify-center gap-3">
            {back.length > 0 && <Link className="inline-flex min-h-11 items-center rounded-full border border-forest px-6 font-semibold text-forest hover:bg-forest hover:text-white" href={`/products?${previous}`}>Previous page</Link>}
            {page.hasNext && page.nextCursor && <Link className="inline-flex min-h-11 items-center rounded-full border border-forest px-6 font-semibold text-forest hover:bg-forest hover:text-white" href={`/products?${next}`}>Next page</Link>}
          </nav>}
        </section>
      </div>
    </main>
  );
}
