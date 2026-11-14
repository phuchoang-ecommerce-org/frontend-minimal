import { getSession } from "@/lib/session";
import { OrderDetail } from "@/components/order-view";
export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  const { orderId } = await params;
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="mb-8 text-4xl font-semibold">Order details</h1>
      {session?.account.role === "MEMBER" ? (
        <OrderDetail id={orderId} />
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
