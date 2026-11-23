import Link from "next/link";
import { HeaderControls } from "./header-controls";

function ProductsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M4 7h16v13H4zM2 7l2-4h16l2 4M9 7v13M4 11h5" />
    </svg>
  );
}
export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <nav
        className="page-shell flex flex-wrap items-center gap-x-4 gap-y-3 py-3"
        aria-label="Main navigation"
      >
        <Link
          className="text-2xl font-black tracking-tight text-forest"
          href="/"
        >
          Market
        </Link>
        <Link
          aria-label="Products"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest"
          href="/products"
        >
          <ProductsIcon />
        </Link>
        <form
          className="site-search order-last flex w-full min-w-0 rounded-md border border-line bg-paper focus-within:border-forest sm:order-none sm:min-w-48 sm:max-w-md sm:flex-1"
          role="search"
          action="/products"
          method="get"
        >
          <label className="sr-only" htmlFor="market-search">
            Search products
          </label>
          <input
            id="market-search"
            name="q"
            type="search"
            placeholder="Search products"
            className="min-h-11 min-w-0 flex-1 rounded-l-md bg-transparent px-4 text-base placeholder:text-sage"
          />
          <button
            type="submit"
            aria-label="Search products"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-r-md border-l border-line text-forest hover:bg-cream"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
        </form>
        <HeaderControls />
      </nav>
    </header>
  );
}
