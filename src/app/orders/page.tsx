import { getSession } from "@/lib/session";
import { OrdersList } from "@/components/order-view";
export default async function OrdersPage() {
  const session = await getSession();
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="mb-8 text-4xl font-semibold">Your orders</h1>
      {session?.account.role === "MEMBER" ? (
        <OrdersList />
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
