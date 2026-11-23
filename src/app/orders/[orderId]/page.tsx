import { getSession } from "@/lib/session";
import { OrderDetail } from "@/components/order-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { hydratePrivate } from "@/lib/server-hydration";
import { Suspense } from "react";
async function MemberOrder({ token, id }: { token: string; id: string }) {
  const state = await hydratePrivate(token, [{ key: ["order", id], path: `/orders/${encodeURIComponent(id)}` }]);
  return <HydrationBoundary state={state}><OrderDetail id={id} /></HydrationBoundary>;
}
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  const { orderId } = await params;
  return (
    <main className="page-shell py-12 sm:py-14">
      <h1 className="page-heading mb-10">Order details</h1>
      {session?.account.role === "MEMBER" ? (
        <Suspense fallback={<p>Loading order…</p>}><MemberOrder token={session.token} id={orderId} /></Suspense>
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
