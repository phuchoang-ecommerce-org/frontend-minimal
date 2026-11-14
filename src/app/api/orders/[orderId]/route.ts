import { commerceRoute } from "@/lib/commerce-route";
export async function GET(
  request: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  return commerceRoute(
    request,
    `/orders/${encodeURIComponent((await ctx.params).orderId)}`,
    "MEMBER",
  );
}
