"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Button, Input } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, Cart } from "@/lib/types";
import { useState } from "react";
export function Header() {
  const router = useRouter();
  const path = usePathname();
  const cache = useQueryClient();
  const [search, setSearch] = useState("");
  const { data: account } = useQuery<Account | null>({
    queryKey: ["session"],
    queryFn: async () =>
      (await (await fetch("/api/session", { cache: "no-store" })).json())
        .account,
  });
  const { data: cart } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const r = await fetch("/api/cart", { cache: "no-store" });
      if (!r.ok) throw new Error("cart");
      return r.json();
    },
    enabled: account === null || account?.role === "MEMBER",
    retry: false,
  });
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    cache.clear();
    router.push("/");
    router.refresh();
  }
  return (
    <header className="border-b border-line bg-paper">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-4 px-5 py-4 sm:px-8 lg:px-10" aria-label="Main navigation">
        <Link className="text-2xl font-black tracking-tight text-forest" href="/">
          Market
        </Link>
        <form
          className="order-last w-full sm:order-none sm:min-w-48 sm:max-w-md sm:flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/products?q=${encodeURIComponent(search)}`);
          }}
        >
          <Input.Search
            aria-label="Search products"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() =>
              router.push(`/products?q=${encodeURIComponent(search)}`)
            }
          />
        </form>
        <Link className="text-sm font-semibold hover:text-forest hover:underline" href="/products">Products</Link>
        {(account === null || account?.role === "MEMBER") && (
          <Link className="text-sm font-semibold hover:text-forest hover:underline" href="/cart">
            <Badge
              count={
                cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0
              }
            >
              Cart
            </Badge>
          </Link>
        )}
        {account?.role === "MEMBER" && <Link className="text-sm font-semibold hover:text-forest hover:underline" href="/orders">Orders</Link>}
        {account?.role === "SELLER" && <Link className="text-sm font-semibold hover:text-forest hover:underline" href="/seller/orders">Seller orders</Link>}
        {account ? (
          <>
            <span className="text-sm text-sage">
              {account.displayName || account.login} ({account.role})
            </span>
            <Button type="text" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          path !== "/login" && <Link className="text-sm font-semibold hover:text-forest hover:underline" href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
