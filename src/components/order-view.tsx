"use client";
import Link from "next/link";
import { Button } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Order, Page, SellerOrder } from "@/lib/types";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 ? "Session expired. Log in again." : response.status === 404 ? "Order not found." : "Could not load orders.");
  return response.json();
}
function Status({ order }: { order: Order }) {
  return <PaymentStatus status={order.status} paymentStatus={order.paymentStatus} />;
}
function PaymentStatus({ status, paymentStatus }: { status: string; paymentStatus: string }) {
  const cancelled = status === "CANCELLED";
  const paid = paymentStatus === "PAID";
  return <span className={`status ${cancelled ? "status-cancelled" : paid ? "status-paid" : "status-pending"}`}>{cancelled ? "Cancelled" : paid ? "Paid" : "Pending payment"}</span>;
}
export function OrderDetail({ id }: { id: string }) {
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const query = useQuery<Order>({ queryKey: ["order", id], queryFn: () => getJson(`/api/orders/${encodeURIComponent(id)}`), retry: false });
  const order = query.data;
  async function cancel() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}/cancellation`, { method: "POST" });
      if (response.ok) { setMessage("Order cancelled."); await cache.invalidateQueries({ queryKey: ["order", id] }); }
      else {
        const result = await response.json().catch(() => ({})) as { code?: string };
        setMessage(response.status === 409 ? "This order can no longer be cancelled. Its latest status is shown below." : response.status === 401 ? "Session expired. Log in again." : `${result.code ?? "Cancellation failed"}. Refresh and try again.`);
        await query.refetch();
      }
    } catch { setMessage("Could not confirm cancellation. Refresh the order before trying again."); }
    finally { setBusy(false); }
  }
  if (query.isLoading) return <p>Loading order…</p>;
  if (query.isError || !order) return <p role="alert">{query.error?.message ?? "Order unavailable."} <Button onClick={() => query.refetch()}>Retry</Button></p>;
  return <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,.6fr)] lg:gap-16">
    <div>
      <section className="border-t border-line pt-6" aria-labelledby="order-overview-heading">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-sage">Placed {new Date(order.createdAt).toLocaleString()}</p><h2 id="order-overview-heading" className="section-heading mt-2">Order overview</h2></div><Button onClick={() => query.refetch()}>Refresh status</Button></div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3"><div><dt className="text-sm text-sage">Status</dt><dd className="mt-2"><Status order={order} /></dd></div><div><dt className="text-sm text-sage">Total</dt><dd className="money mt-1 text-xl font-semibold">${order.totalUsd}</dd></div><div><dt className="text-sm text-sage">Payment</dt><dd className="mt-1 font-medium">Cash on delivery</dd></div></dl>
      </section>
      <section className="mt-10 border-t border-line pt-6" aria-labelledby="purchased-items-heading"><h2 id="purchased-items-heading" className="section-heading">Purchased items</h2><ul className="mt-4 divide-y divide-line">{order.sellerOrders.map((part) => <li key={part.id} className="py-5"><div className="flex items-center justify-between gap-4"><PaymentStatus status={part.status} paymentStatus={part.paymentStatus} /><span className="money font-semibold">${part.totalUsd}</span></div><ul className="mt-3 space-y-2 text-sm text-sage">{part.lines.map((line) => <li key={line.variantId} className="flex justify-between gap-4"><span>{line.productName} · {line.quantity} × ${line.unitPriceUsd}</span></li>)}</ul></li>)}</ul></section>
    </div>
    <section className="h-fit border-t border-line pt-6" aria-labelledby="delivery-heading"><h2 id="delivery-heading" className="section-heading">Delivery address</h2><p className="mt-4 leading-7">{order.address.recipient}<br />{order.address.addressLine}<br />{order.address.locality}, {order.address.postalCode}<br />{order.address.country}</p>
      {order.status === "PLACED" && order.sellerOrders.every((part) => part.paymentStatus === "PENDING_PAYMENT") && <Button danger className="mt-8 min-h-11" loading={busy} onClick={cancel}>Cancel unpaid order</Button>}
      {order.status === "PLACED" && order.sellerOrders.some((part) => part.paymentStatus === "PAID") && <p className="mt-6 text-sm text-sage">This order cannot be cancelled because a Seller has recorded payment.</p>}
      {message && <p role="status" className="notice mt-4">{message}</p>}
    </section>
  </div>;
}
export function OrdersList({ cursor, back }: { cursor: string; back: string[] }) {
  const query = useQuery<Page<Order>>({ queryKey: ["orders", cursor], queryFn: () => getJson(`/api/orders?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`), retry: false });
  const next = new URLSearchParams();
  for (const prior of back) next.append("back", prior);
  next.append("back", cursor || "start");
  if (query.data?.nextCursor) next.set("cursor", query.data.nextCursor);
  const previous = new URLSearchParams();
  for (const prior of back.slice(0, -1)) previous.append("back", prior);
  const previousCursor = back.at(-1);
  if (previousCursor && previousCursor !== "start") previous.set("cursor", previousCursor);
  return <section className="border-t border-line">{query.isLoading ? <p className="py-6">Loading orders…</p> : query.isError ? <p role="alert" className="py-6">Could not load orders. {cursor ? <Link className="underline" href="/orders">Start again</Link> : <Button onClick={() => query.refetch()}>Retry</Button>}</p> : !query.data?.items.length ? <p className="py-6">No orders on this page.</p> : <ul className="divide-y divide-line">{query.data.items.map((order) => <li key={order.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-8"><div><p className="text-sm text-sage">Placed {new Date(order.createdAt).toLocaleString()}</p><div className="mt-2"><Status order={order} /></div></div><strong className="money text-lg">${order.totalUsd}</strong><Link href={`/orders/${order.id}`} className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4">View order</Link></li>)}</ul>}
    <nav aria-label="Order pages" className="mt-5 flex flex-wrap gap-3">{back.length > 0 && <Link className="button-secondary" href={`/orders?${previous}`}>Previous page</Link>}{query.data?.hasNext && query.data.nextCursor && <Link className="button-secondary" href={`/orders?${next}`}>Next page</Link>}</nav></section>;
}
export function SellerOrders({ cursor, back }: { cursor: string; back: string[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const query = useQuery<Page<SellerOrder>>({ queryKey: ["seller-orders", cursor], queryFn: () => getJson(`/api/seller/orders?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`), retry: false });
  const next = new URLSearchParams();
  for (const prior of back) next.append("back", prior);
  next.append("back", cursor || "start");
  if (query.data?.nextCursor) next.set("cursor", query.data.nextCursor);
  const previous = new URLSearchParams();
  for (const prior of back.slice(0, -1)) previous.append("back", prior);
  const previousCursor = back.at(-1);
  if (previousCursor && previousCursor !== "start") previous.set("cursor", previousCursor);
  async function markPaid(id: string) {
    setBusy(id); setMessage("");
    try {
      const response = await fetch(`/api/seller/orders/${id}/mark-paid`, { method: "POST" });
      if (response.ok) setMessage("Cash receipt recorded.");
      else setMessage(response.status === 409 ? "Payment state changed. Review the refreshed portion." : response.status === 404 ? "That portion is unavailable to this Seller." : "Could not record cash. Review the refreshed portion.");
      await query.refetch();
    } catch { setMessage("Could not confirm the result. Refresh before trying again."); }
    finally { setBusy(null); }
  }
  return <section className="border-t border-line">
    <div className="flex justify-end border-b border-line py-4"><Button onClick={() => query.refetch()}>Refresh orders</Button></div>
    {message && <p role="status" className="notice my-4">{message}</p>}
    {query.isLoading ? <p className="py-6">Loading Seller orders…</p> : query.isError ? <p role="alert" className="py-6">Could not load Seller orders. {cursor ? <Link className="underline" href="/seller/orders">Start again</Link> : <Button onClick={() => query.refetch()}>Retry</Button>}</p> : !query.data?.items.length ? <p className="py-6">No Seller orders on this page.</p> : <>
      <div className="hidden md:block"><table className="w-full table-fixed text-left"><thead><tr className="border-b border-line text-xs font-semibold text-sage"><th scope="col" className="w-[17%] py-3 pr-4">Placed</th><th scope="col" className="w-[31%] py-3 pr-4">Items</th><th scope="col" className="w-[14%] py-3 pr-4">Total</th><th scope="col" className="w-[17%] py-3 pr-4">Status</th><th scope="col" className="w-[21%] py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-line">{query.data.items.map((part) => <tr key={part.id} className="align-top"><td className="py-5 pr-4 text-sm text-sage tabular-nums">{new Date(part.createdAt).toLocaleString()}</td><td className="py-5 pr-4"><ul className="space-y-1 text-sm">{part.lines.map((line) => <li key={line.variantId} className="break-words">{line.productName} <span className="text-sage">× {line.quantity}</span></li>)}</ul></td><td className="money py-5 pr-4 font-semibold">${part.totalUsd}</td><td className="py-5 pr-4"><PaymentStatus status={part.status} paymentStatus={part.paymentStatus} /></td><td className="py-4 text-right">{part.status === "PLACED" && part.paymentStatus === "PENDING_PAYMENT" && <Button type="primary" className="min-h-11" loading={busy === part.id} onClick={() => markPaid(part.id)}>Record COD cash</Button>}</td></tr>)}</tbody></table></div>
      <ul className="divide-y divide-line md:hidden">{query.data.items.map((part) => <li key={part.id} className="py-5"><div className="flex flex-wrap items-start justify-between gap-3"><p className="text-sm text-sage tabular-nums">{new Date(part.createdAt).toLocaleString()}</p><PaymentStatus status={part.status} paymentStatus={part.paymentStatus} /></div><ul className="mt-4 space-y-1 text-sm">{part.lines.map((line) => <li key={line.variantId}>{line.productName} <span className="text-sage">× {line.quantity}</span></li>)}</ul><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><strong className="money text-lg">${part.totalUsd}</strong>{part.status === "PLACED" && part.paymentStatus === "PENDING_PAYMENT" && <Button type="primary" className="min-h-11" loading={busy === part.id} onClick={() => markPaid(part.id)}>Record COD cash</Button>}</div></li>)}</ul>
    </>}
    <nav aria-label="Seller order pages" className="mt-5 flex flex-wrap gap-3">{back.length > 0 && <Link className="button-secondary" href={`/seller/orders?${previous}`}>Previous page</Link>}{query.data?.hasNext && query.data.nextCursor && <Link className="button-secondary" href={`/seller/orders?${next}`}>Next page</Link>}</nav>
  </section>;
}
