import Link from "next/link";
import { getSession } from "@/lib/session";
import { CheckoutView } from "@/components/checkout-view";
export default async function CheckoutPage() {
  const session = await getSession();
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest">
        Checkout
      </p>
      <h1 className="mb-8 text-4xl font-semibold">Place your order</h1>
      {session?.account.role === "MEMBER" ? (
        <CheckoutView memberId={session.account.id} />
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
