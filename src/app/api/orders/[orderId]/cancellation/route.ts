import { commerceRoute } from "@/lib/commerce-route";
export async function POST(
  request: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  return commerceRoute(
    request,
    `/orders/${encodeURIComponent((await ctx.params).orderId)}/cancellation`,
    "MEMBER",
    "POST",
  );
}
