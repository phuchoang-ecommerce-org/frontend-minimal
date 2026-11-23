import { getSession } from "@/lib/session";
import { SellerOrders } from "@/components/order-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { hydratePrivate } from "@/lib/server-hydration";
import { Suspense } from "react";
async function SellerOrderData({ token, cursor, back }: { token: string; cursor: string; back: string[] }) {
  const state = await hydratePrivate(token, [{ key: ["seller-orders", cursor], path: `/seller/orders?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}` }]);
  return <HydrationBoundary state={state}><SellerOrders cursor={cursor} back={back} /></HydrationBoundary>;
}
export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="page-shell py-12 sm:py-14">
      <p className="eyebrow mb-2">Order management</p>
      <h1 className="page-heading mb-10">Seller orders</h1>
      {session?.account.role === "SELLER" ? (
        <Suspense fallback={<p>Loading Seller orders…</p>}><SellerOrderData token={session.token} cursor={cursor} back={back} /></Suspense>
      ) : (
        <p>This area is for Sellers.</p>
      )}
    </main>
  );
}
