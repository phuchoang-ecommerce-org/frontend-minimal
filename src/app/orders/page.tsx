import { getSession } from "@/lib/session";
import { OrdersList } from "@/components/order-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { hydratePrivate } from "@/lib/server-hydration";
import { Suspense } from "react";
async function MemberOrders({ token, cursor, back }: { token: string; cursor: string; back: string[] }) {
  const state = await hydratePrivate(token, [{ key: ["orders", cursor], path: `/orders?limit=20${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}` }]);
  return <HydrationBoundary state={state}><OrdersList cursor={cursor} back={back} /></HydrationBoundary>;
}
export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="page-shell py-12 sm:py-14">
      <h1 className="page-heading mb-10">Your orders</h1>
      {session?.account.role === "MEMBER" ? (
        <Suspense fallback={<p>Loading orders…</p>}><MemberOrders token={session.token} cursor={cursor} back={back} /></Suspense>
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
