import { getSession } from "@/lib/session";
import { CartView } from "@/components/cart-view";
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
      <CartView actor={session ? "MEMBER" : "GUEST"} />
    </main>
  );
}
