import { commerceRoute } from "@/lib/commerce-route";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  return commerceRoute(
    request,
    `/me/addresses${query ? `?${query}` : ""}`,
    "MEMBER",
  );
}
