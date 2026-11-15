import { getSession } from "@/lib/session";
import { OrdersList } from "@/components/order-view";
export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="page-shell py-12 sm:py-14">
      <h1 className="page-heading mb-10">Your orders</h1>
      {session?.account.role === "MEMBER" ? (
        <OrdersList cursor={cursor} back={back} />
      ) : (
        <p>This area is for Members.</p>
      )}
    </main>
  );
}
