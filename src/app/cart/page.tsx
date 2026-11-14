import { getSession } from "@/lib/session";
import { CartView } from "@/components/cart-view";
export default async function CartPage() {
  const session = await getSession();
  if (session && session.account.role !== "MEMBER")
    return (
      <main className="container">
        <h1>Cart unavailable</h1>
        <p>This area is for Guests and Members.</p>
      </main>
    );
  return (
    <main className="container">
      <h1>Your cart</h1>
      <CartView actor={session ? "MEMBER" : "GUEST"} />
    </main>
  );
}
