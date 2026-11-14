"use client";
import { Button, InputNumber, Select } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Cart } from "@/lib/types";
export function AddToCart({
  variants,
}: {
  variants: {
    id: string;
    label: string;
    priceUsd: string;
    stock: { onHand: number };
  }[];
}) {
  const eligible = variants.filter((v) => v.stock.onHand > 0);
  const [id, setId] = useState(eligible[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const cache = useQueryClient();
  const router = useRouter();
  async function add() {
    if (!id) return;
    setBusy(true);
    setMessage("");
    try {
      let cart = cache.getQueryData<Cart>(["cart"]);
      if (!cart) {
        const r = await fetch("/api/cart");
        if (!r.ok) throw new Error("Cart unavailable");
        cart = await r.json();
      }
      const current =
        cart!.lines.find((l) => l.variantId === id)?.quantity ?? 0;
      const r = await fetch(`/api/cart/lines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: current + quantity,
          expectedVersion: cart!.version,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (data.code === "STALE_VERSION") {
          await cache.invalidateQueries({ queryKey: ["cart"] });
          throw new Error("Cart changed. Review it and try again.");
        }
        throw new Error(
          data.code === "ITEM_UNAVAILABLE"
            ? "This variant is unavailable."
            : "Could not add to cart.",
        );
      }
      await cache.invalidateQueries({ queryKey: ["cart"] });
      router.push("/cart");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not add to cart.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-stack">
      <label>
        Variant{" "}
        <Select
          value={id}
          onChange={setId}
          options={eligible.map((v) => ({
            value: v.id,
            label: `${v.label} · $${v.priceUsd} · ${v.stock.onHand} available`,
          }))}
        />
      </label>
      <label>
        Quantity{" "}
        <InputNumber
          min={1}
          max={Math.max(
            1,
            eligible.find((v) => v.id === id)?.stock.onHand ?? 1,
          )}
          value={quantity}
          onChange={(v) => setQuantity(v ?? 1)}
        />
      </label>
      <Button type="primary" disabled={!id} loading={busy} onClick={add}>
        Add to cart
      </Button>
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
