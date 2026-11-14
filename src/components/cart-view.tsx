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
    <div className="panel">
      {rejected.length > 0 && (
        <div className="notice" role="status">
          <strong>Some Guest items could not be merged:</strong>
          <ul>
            {rejected.map((line) => (
              <li key={line.variantId}>
                {line.variantId}:{" "}
                {line.code === "QUANTITY_EXCEEDED"
                  ? "quantity exceeds availability"
                  : "item unavailable"}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isLoading ? (
        <p>Loading cart…</p>
      ) : !cart ? (
        <p role="alert">
          Cart unavailable. <Button onClick={() => refetch()}>Retry</Button>
        </p>
      ) : cart.lines.length ? (
        <>
          {cart.lines.map((line) => (
            <div className="cart-line" key={line.variantId}>
              <div>
                <strong>Variant {line.variantId}</strong>
                <p>${line.unitPriceUsd} each</p>
              </div>
              <div>
                <label>
                  Quantity{" "}
                  <InputNumber
                    min={1}
                    value={line.quantity}
                    disabled={busy === line.variantId}
                    onChange={(v) => {
                      if (v && v !== line.quantity) change(line.variantId, v);
                    }}
                  />
                </label>{" "}
                <Button
                  disabled={busy === line.variantId}
                  onClick={() => change(line.variantId, 0)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <h2>Total: ${cart.totalUsd}</h2>
          {actor === "GUEST" ? (
            <p>
              <Link href="/login">Log in to continue to checkout</Link>
            </p>
          ) : (
            <p>Checkout is planned for Sprint 2.</p>
          )}
        </>
      ) : (
        <p>
          Your cart is empty. <Link href="/products">Browse products</Link>
        </p>
      )}
      {error && (
        <p className="danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
