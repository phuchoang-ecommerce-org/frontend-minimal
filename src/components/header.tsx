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
    <header className="site-header">
      <nav className="header-inner" aria-label="Main navigation">
        <Link className="brand" href="/">
          Market
        </Link>
        <form
          className="header-search"
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
        <Link href="/products">Products</Link>
        {(account === null || account?.role === "MEMBER") && (
          <Link href="/cart">
            <Badge
              count={
                cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0
              }
            >
              Cart
            </Badge>
          </Link>
        )}
        {account ? (
          <>
            <span>
              {account.displayName || account.login} ({account.role})
            </span>
            <Button type="text" onClick={logout}>
              Log out
            </Button>
          </>
        ) : (
          path !== "/login" && <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
