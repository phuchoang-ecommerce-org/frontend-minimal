import Link from "next/link";
import { getSession } from "@/lib/session";
import { CheckoutView } from "@/components/checkout-view";
import { HydrationBoundary } from "@tanstack/react-query";
import { hydratePrivate } from "@/lib/server-hydration";
import { Suspense } from "react";
async function MemberCheckout({ token, memberId }: { token: string; memberId: string }) {
  const state = await hydratePrivate(token, [
    { key: ["cart"], path: "/cart" },
    { key: ["addresses"], path: "/me/addresses?limit=100" },
  ]);
  return <HydrationBoundary state={state}><CheckoutView memberId={memberId} /></HydrationBoundary>;
}
export default async function CheckoutPage() {
  const session = await getSession();
  return (
    <main className="page-shell py-12 sm:py-14">
      <p className="eyebrow mb-2">
        Checkout
      </p>
      <h1 className="page-heading mb-10">Place your order</h1>
      {session?.account.role === "MEMBER" ? (
        <Suspense fallback={<p>Loading checkout…</p>}><MemberCheckout token={session.token} memberId={session.account.id} /></Suspense>
      ) : (
        <p>
          This area is for Members.{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      )}
    </main>
  );
}
