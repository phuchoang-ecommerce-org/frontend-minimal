import { commerceRoute } from "@/lib/commerce-route";
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.toString();
  return commerceRoute(request, `/orders${query ? `?${query}` : ""}`, "MEMBER");
}
export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
  const order = body as Record<string, unknown>;
  if (
    typeof order.addressId !== "string" ||
    !Number.isInteger(order.cartVersion) ||
    order.paymentMethod !== "COD" ||
    Object.keys(order).some(
      (k) => !["addressId", "cartVersion", "paymentMethod"].includes(k),
    )
  )
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
  const key = request.headers.get("idempotency-key");
  if (!key || key.length > 128)
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
  return commerceRoute(
    request,
    "/orders",
    "MEMBER",
    "POST",
    JSON.stringify(order),
    key,
  );
}
