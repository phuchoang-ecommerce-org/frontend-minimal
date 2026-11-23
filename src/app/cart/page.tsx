import { getSession } from "@/lib/session";
import { CartView } from "@/components/cart-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { hydratePrivate } from "@/lib/server-hydration";
import { Suspense } from "react";
async function MemberCart({ token }: { token: string }) {
  const state = await hydratePrivate(token, [{ key: ["cart"], path: "/cart" }]);
  return <HydrationBoundary state={state}><CartView actor="MEMBER" /></HydrationBoundary>;
}
export default async function CartPage() {
  const session = await getSession();
  if (session && session.account.role !== "MEMBER")
    return (
      <main className="page-shell py-12 sm:py-14">
        <h1 className="page-heading mb-4">Cart unavailable</h1>
        <p>This area is for Guests and Members.</p>
      </main>
    );
  return (
    <main className="page-shell py-12 sm:py-14">
      <p className="eyebrow mb-2">Your selections</p>
      <h1 className="page-heading mb-10">Your cart</h1>
      {session ? <Suspense fallback={<p>Loading cart…</p>}><MemberCart token={session.token} /></Suspense> : <CartView actor="GUEST" />}
    </main>
  );
}
