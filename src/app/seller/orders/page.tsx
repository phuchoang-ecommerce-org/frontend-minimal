import { getSession } from "@/lib/session";
import { SellerOrders } from "@/components/order-view";
export default async function SellerOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await getSession();
  const params = await searchParams;
  const cursor = typeof params.cursor === "string" ? params.cursor : "";
  const back = Array.isArray(params.back) ? params.back : typeof params.back === "string" ? [params.back] : [];
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <h1 className="mb-8 text-4xl font-semibold">Seller orders</h1>
      {session?.account.role === "SELLER" ? (
        <SellerOrders cursor={cursor} back={back} />
      ) : (
        <p>This area is for Sellers.</p>
      )}
    </main>
  );
}
