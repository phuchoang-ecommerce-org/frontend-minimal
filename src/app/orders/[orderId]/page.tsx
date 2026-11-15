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
    <main className="page-shell py-12 sm:py-14">
      <h1 className="page-heading mb-10">Order details</h1>
      {session?.account.role === "MEMBER" ? (
        <OrderDetail id={orderId} />
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
