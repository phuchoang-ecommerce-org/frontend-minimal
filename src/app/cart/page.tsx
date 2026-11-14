import { getSession } from "@/lib/session";
import { CartView } from "@/components/cart-view";
export default async function CartPage() {
  const session = await getSession();
  if (session && session.account.role !== "MEMBER")
    return (
      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <h1 className="mb-4 text-4xl font-semibold tracking-tight">Cart unavailable</h1>
        <p>This area is for Guests and Members.</p>
      </main>
    );
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-forest">Your selections</p>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Your cart</h1>
      <CartView actor={session ? "MEMBER" : "GUEST"} />
    </main>
  );
}
