import { commerceRoute } from "@/lib/commerce-route";
export async function POST(
  request: Request,
  ctx: { params: Promise<{ sellerOrderId: string }> },
) {
  return commerceRoute(
    request,
    `/seller/orders/${encodeURIComponent((await ctx.params).sellerOrderId)}/mark-paid`,
    "SELLER",
    "POST",
  );
}
