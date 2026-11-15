"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Dropdown, Input } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, Cart } from "@/lib/types";
function CartIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M2 3h2l2.5 12h13l2-9H5" /></svg>;
}
function UserIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="9" r="3" /><path d="M5.5 19a7 7 0 0 1 13 0" /></svg>;
}
function ProductsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 7h16v13H4zM2 7l2-4h16l2 4M9 7v13M4 11h5" /></svg>;
}
export function Header() {
  const router = useRouter();
  const cache = useQueryClient();
  const { data: account, isPending: sessionPending } = useQuery<Account | null>({
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
    const response = await fetch("/api/logout", { method: "POST" });
    if (!response.ok) return;
    cache.clear();
    window.location.replace(new URL("/", window.location.href).href);
  }
  const accountItems = account
    ? [
        { key: "identity", label: account.displayName || account.login, disabled: true },
        ...(account.role === "MEMBER" || account.role === "SELLER"
          ? [{ key: "orders", label: <Link href={account.role === "SELLER" ? "/seller/orders" : "/orders"}>{account.role === "SELLER" ? "Seller orders" : "Orders"}</Link> }]
          : []),
        { key: "logout", label: "Log out", onClick: logout },
      ]
    : [{ key: "login", label: <Link href="/login">Log in</Link> }];
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3 sm:px-8 lg:px-10" aria-label="Main navigation">
        <Link className="text-2xl font-black tracking-tight text-forest" href="/">
          Market
        </Link>
        <Link aria-label="Products" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest" href="/products"><ProductsIcon /></Link>
        <div className="order-last w-full sm:order-none sm:min-w-48 sm:max-w-md sm:flex-1">
          <Input.Search
            aria-label="Search products"
            placeholder="Search products"
            onSearch={(value) =>
              router.push(`/products?q=${encodeURIComponent(value)}`)
            }
          />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(account === null || account?.role === "MEMBER") && (
            <Badge count={cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0}>
              <Link aria-label="Cart" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest" href="/cart"><CartIcon /></Link>
            </Badge>
          )}
          <Dropdown menu={{ items: accountItems }} trigger={["click"]} placement="bottomRight" disabled={sessionPending}>
            <button aria-label="Account menu" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest" type="button"><UserIcon /></button>
          </Dropdown>
        </div>
      </nav>
    </header>
  );
}
