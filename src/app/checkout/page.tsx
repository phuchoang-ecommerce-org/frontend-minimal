import Link from "next/link";
import { getSession } from "@/lib/session";
import { CheckoutView } from "@/components/checkout-view";
export default async function CheckoutPage() {
  const session = await getSession();
  return (
    <main className="page-shell py-12 sm:py-14">
      <p className="eyebrow mb-2">
        Checkout
      </p>
      <h1 className="page-heading mb-10">Place your order</h1>
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
