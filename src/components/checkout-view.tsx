"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Address, Cart, Order, Page } from "@/lib/types";

type Pending = { key: string; body: string };
async function load<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? "Session expired. Log in again."
        : "Could not load checkout details.",
    );
  return response.json();
}
export function CheckoutView({ memberId }: { memberId: string }) {
  const router = useRouter();
  const cache = useQueryClient();
  const storageKey = `pending-cod-order:${memberId}`;
  const [pending, setPending] = useState<Pending | null>(null);
  const [addressId, setAddressId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const cart = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: () => load("/api/cart"),
    retry: false,
  });
  const addresses = useQuery<Page<Address>>({
    queryKey: ["addresses"],
    queryFn: () => load("/api/addresses?limit=100"),
    retry: false,
  });
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const value = JSON.parse(saved) as Pending;
        if (typeof value.key === "string" && typeof value.body === "string")
          setTimeout(() => setPending(value), 0);
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);
  async function submit() {
    if (!pending && (!cart.data?.lines.length || !addressId)) {
      setMessage(
        "Select an address and review your cart before placing the order.",
      );
      return;
    }
    const attempt = pending ?? {
      key: crypto.randomUUID(),
      body: JSON.stringify({
        addressId,
        cartVersion: cart.data!.version,
        paymentMethod: "COD",
      }),
    };
    sessionStorage.setItem(storageKey, JSON.stringify(attempt));
    setPending(attempt);
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": attempt.key,
        },
        body: attempt.body,
      });
      if (response.status === 201) {
        const order = (await response.json()) as Order;
        sessionStorage.removeItem(storageKey);
        setPending(null);
        await cache.invalidateQueries({ queryKey: ["cart"] });
        router.push(`/orders/${order.id}`);
        return;
      }
      const result = (await response.json().catch(() => ({}))) as {
        code?: string;
      };
      if (response.status === 409) {
        sessionStorage.removeItem(storageKey);
        setPending(null);
        await Promise.all([cart.refetch(), addresses.refetch()]);
        setMessage(
          `${result.code ?? "Checkout conflict"}. Review the refreshed cart and address, then place a new order.`,
        );
      } else if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 400 ||
        response.status === 404
      ) {
        sessionStorage.removeItem(storageKey);
        setPending(null);
        setMessage(
          response.status === 401
            ? "Session expired. Log in again."
            : `${result.code ?? "Checkout rejected"}. Review your order details.`,
        );
      } else
        setMessage(
          "The result is uncertain. Retry the same order request to check whether it was placed.",
        );
    } catch {
      setMessage(
        "The result is uncertain. Retry the same order request to check whether it was placed.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section
        className="rounded-2xl border border-line bg-paper p-5 sm:p-8"
        aria-labelledby="address-heading"
      >
        <h2 id="address-heading" className="text-2xl font-semibold">
          Delivery address
        </h2>
        {addresses.isLoading ? (
          <p className="mt-5">Loading addresses…</p>
        ) : addresses.isError ? (
          <p role="alert" className="mt-5">
            Could not load addresses.{" "}
            <Button onClick={() => addresses.refetch()}>Retry</Button>
          </p>
        ) : !addresses.data?.items.length ? (
          <p className="mt-5">No saved address is available for checkout.</p>
        ) : (
          <fieldset className="mt-5 grid gap-3" disabled={!!pending || busy}>
            <legend className="sr-only">Choose a delivery address</legend>
            {addresses.data.items.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-4 rounded-xl border p-4 ${addressId === address.id ? "border-forest bg-[#edf4ed]" : "border-line"}`}
              >
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={addressId === address.id}
                  onChange={() => setAddressId(address.id)}
                />
                <span>
                  <strong>{address.recipient}</strong>
                  <br />
                  {address.addressLine}, {address.locality},{" "}
                  {address.postalCode}, {address.country}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </section>
      <section
        className="h-fit rounded-2xl border border-line bg-paper p-5 sm:p-8"
        aria-labelledby="review-heading"
      >
        <h2 id="review-heading" className="text-2xl font-semibold">
          Review order
        </h2>
        {cart.isLoading ? (
          <p className="mt-5">Loading cart…</p>
        ) : cart.isError ? (
          <p role="alert" className="mt-5">
            Could not load cart.{" "}
            <Button onClick={() => cart.refetch()}>Retry</Button>
          </p>
        ) : (
          <>
            <p className="mt-4 text-sage">{cart.data?.lines.length ?? 0} items</p>
            <ul className="mt-4 divide-y divide-line">
              {cart.data?.lines.map((line) => (
                <li
                  key={line.variantId}
                  className="flex justify-between gap-3 py-3"
                >
                  <span>{line.productName} · {line.variantLabel} × {line.quantity}</span>
                  <span>${line.unitPriceUsd}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xl font-semibold">
              Total ${cart.data?.totalUsd}
            </p>
            {!cart.data?.lines.length && (
              <p className="mt-4">
                Your cart is empty.{" "}
                <Link href="/products" className="underline">
                  Browse products
                </Link>
              </p>
            )}
          </>
        )}
        <p className="mt-4 text-sm text-sage">
          Cash on delivery. Stock and prices are checked when you place the
          order.
        </p>
        {pending && (
          <p
            className="mt-4 rounded-lg border border-clay bg-[#fff4e9] p-3"
            role="status"
          >
            A checkout request may already have succeeded. Retry uses the same
            request and key.
          </p>
        )}
        {message && (
          <p
            className="mt-4 rounded-lg bg-[#fff0e9] p-3 text-[#9f3327]"
            role="alert"
          >
            {message}
          </p>
        )}
        <Button
          type="primary"
          className="mt-5 min-h-11 w-full"
          loading={busy}
          disabled={
            !pending &&
            (!cart.data?.lines.length || !addresses.data?.items.length)
          }
          onClick={submit}
        >
          {pending ? "Retry same order" : "Place COD order"}
        </Button>
        <Link
          href="/cart"
          className="mt-4 inline-block text-sm font-semibold text-forest underline"
        >
          Edit cart
        </Link>
      </section>
    </div>
  );
}
