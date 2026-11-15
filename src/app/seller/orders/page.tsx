import { getSession } from "@/lib/session";
import { SellerOrders } from "@/components/order-view";
export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="page-shell py-12 sm:py-14">
      <p className="eyebrow mb-2">Order management</p>
      <h1 className="page-heading mb-10">Seller orders</h1>
      {session?.account.role === "SELLER" ? (
        <SellerOrders cursor={cursor} back={back} />
      ) : (
        <p>This area is for Sellers.</p>
      )}
    </main>
  );
}
