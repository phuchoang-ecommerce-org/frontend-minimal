"use client";
import Link from "next/link";
import { Button, InputNumber } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Cart, MergeRejection } from "@/lib/types";
export function CartView({ actor }: { actor: "GUEST" | "MEMBER" }) {
  const cache = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [rejected, setRejected] = useState<MergeRejection[]>([]);
  useEffect(() => {
    const raw = sessionStorage.getItem("cartMergeRejected");
    if (raw) {
      try {
        setTimeout(() => setRejected(JSON.parse(raw)), 0);
      } catch {}
      sessionStorage.removeItem("cartMergeRejected");
    }
  }, []);
  const {
    data: cart,
    isLoading,
    refetch,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const r = await fetch("/api/cart", { cache: "no-store" });
      if (!r.ok) throw new Error("Cart unavailable");
      return r.json();
    },
    retry: false,
  });
  async function change(id: string, quantity: number) {
    if (!cart) return;
    setBusy(id);
    setError("");
    try {
      const remove = quantity === 0;
      const r = await fetch(
        `/api/cart/lines/${id}${remove ? `?expectedVersion=${cart.version}` : ""}`,
        {
          method: remove ? "DELETE" : "PUT",
          headers: remove ? undefined : { "Content-Type": "application/json" },
          body: remove
            ? undefined
            : JSON.stringify({ quantity, expectedVersion: cart.version }),
        },
      );
      if (!r.ok) {
        const result = await r.json();
        if (result.code === "STALE_VERSION") {
          await refetch();
          throw new Error(
            "Cart changed. Review the latest quantities before trying again.",
          );
        }
        throw new Error(
          result.code === "ITEM_UNAVAILABLE"
            ? "That variant is unavailable."
            : "Cart update failed.",
        );
      }
      await cache.invalidateQueries({ queryKey: ["cart"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cart update failed.");
    } finally {
      setBusy(null);
    }
  }
  return (
    <div>
      {rejected.length > 0 && (
        <div className="notice mb-5" role="status">
          <strong>Some Guest items could not be merged:</strong>
          <p>{rejected.length} item{rejected.length === 1 ? "" : "s"} could not be added. Review your cart and try adding them again if available.</p>
        </div>
      )}
      {isLoading ? (
        <p>Loading cart…</p>
      ) : !cart ? (
        <p role="alert">
          Cart unavailable. <Button onClick={() => refetch()}>Retry</Button>
        </p>
      ) : cart.lines.length ? (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
          <section aria-label="Cart items" className="border-t border-line">
          {cart.lines.map((line) => (
            <div className="grid gap-4 border-b border-line py-6 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={line.variantId}>
              <div className="min-w-0">
                <strong className="font-semibold">{line.productName}</strong>
                <p className="mt-1 text-sm text-sage">{line.variantLabel} · <span className="money">${line.unitPriceUsd}</span> each</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                <label className="flex items-center gap-2 text-sm text-sage">
                  Quantity
                  <InputNumber
                    min={1}
                    aria-label={`Quantity for ${line.productName}`}
                    value={line.quantity}
                    disabled={busy === line.variantId}
                    onChange={(v) => {
                      if (v && v !== line.quantity) change(line.variantId, v);
                    }}
                  />
                </label>
              </div>
              <Button type="text" danger disabled={busy === line.variantId} onClick={() => change(line.variantId, 0)}>Remove</Button>
            </div>
          ))}
          </section>
          <aside aria-label="Cart summary" className="h-fit border-t border-line bg-[var(--surface-muted)] p-6 lg:sticky lg:top-28">
          <h2 className="section-heading">Order summary</h2>
          <p className="mt-5 flex justify-between gap-3 border-t border-line pt-5 text-lg font-semibold text-forest"><span>Total</span><span className="money">${cart.totalUsd}</span></p>
          {actor === "GUEST" ? (
            <p>
              <Link className="mt-5 inline-flex min-h-11 items-center font-semibold text-forest underline" href="/login">Log in to continue to checkout</Link>
            </p>
          ) : (
            <p className="mt-5"><Link className="button-primary w-full" href="/checkout">Continue to checkout</Link></p>
          )}
          </aside>
        </div>
      ) : (
        <p className="py-6 text-sage">
          Your cart is empty. <Link className="font-semibold text-forest underline" href="/products">Browse products</Link>
        </p>
      )}
      {error && (
        <p className="notice-error mt-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
