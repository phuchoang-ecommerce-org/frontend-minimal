"use client";
import Link from "next/link";
import { Badge, Dropdown } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, Cart } from "@/lib/types";
function CartIcon() {
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
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M2 3h2l2.5 12h13l2-9H5" />
    </svg>
  );
}
function UserIcon() {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="9" r="3" />
      <path d="M5.5 19a7 7 0 0 1 13 0" />
    </svg>
  );
}
export function HeaderControls() {
  const cache = useQueryClient();
  const { data: account, isPending: sessionPending } = useQuery<Account | null>(
    {
      queryKey: ["session"],
      queryFn: async () =>
        (await (await fetch("/api/session", { cache: "no-store" })).json())
          .account,
    },
  );
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
        {
          key: "identity",
          label: account.displayName || account.login,
          disabled: true,
        },
        ...(account.role === "MEMBER" || account.role === "SELLER"
          ? [
              {
                key: "orders",
                label: (
                  <Link
                    href={
                      account.role === "SELLER" ? "/seller/orders" : "/orders"
                    }
                  >
                    {account.role === "SELLER" ? "Seller orders" : "Orders"}
                  </Link>
                ),
              },
            ]
          : []),
        { key: "logout", label: "Log out", onClick: logout },
      ]
    : [{ key: "login", label: <Link href="/login">Log in</Link> }];
  return (
    <div className="ml-auto flex items-center gap-2">
      {(account === null || account?.role === "MEMBER") && (
        <Badge
          count={cart?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0}
        >
          <Link
            aria-label="Cart"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest"
            href="/cart"
          >
            <CartIcon />
          </Link>
        </Badge>
      )}
      <Dropdown
        menu={{ items: accountItems }}
        trigger={["click"]}
        placement="bottomRight"
        disabled={sessionPending}
      >
        <button
          aria-label="Account menu"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-cream hover:text-forest"
          type="button"
        >
          <UserIcon />
        </button>
      </Dropdown>
    </div>
  );
}
