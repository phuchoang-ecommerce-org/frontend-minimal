import { getSession } from "@/lib/session";
import { SellerOrders } from "@/components/order-view";
export default async function SellerOrdersPage() {
  const session = await getSession();
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="mb-8 text-4xl font-semibold">Seller orders</h1>
      {session?.account.role === "SELLER" ? (
        <SellerOrders />
      ) : (
        <p>This area is for Sellers.</p>
      )}
    </main>
  );
}
