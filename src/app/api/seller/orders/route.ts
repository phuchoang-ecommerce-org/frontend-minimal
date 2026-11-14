import { commerceRoute } from "@/lib/commerce-route";
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.toString();
  return commerceRoute(
    request,
    `/seller/orders${query ? `?${query}` : ""}`,
    "SELLER",
  );
}
