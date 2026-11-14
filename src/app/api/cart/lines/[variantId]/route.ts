import { api, currentToken, errorResponse } from "@/lib/api";
import { denied, privateHeaders, sameOrigin } from "@/lib/origin";

async function mutate(
  request: Request,
  variantId: string,
  method: "PUT" | "DELETE",
) {
  if (!sameOrigin(request)) return denied();
  try {
    const token = await currentToken();
    const guest = request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)guest_cart=([^;]*)/)?.[1];
    const headers: Record<string, string> = {
      Origin: new URL(request.url).origin,
    };
    if (guest && !token) headers.Cookie = `guest_cart=${guest}`;
    let path = `/cart/lines/${encodeURIComponent(variantId)}`;
    let body: string | undefined;
    if (method === "PUT") {
      const input = await request.json();
      if (
        !Number.isInteger(input.quantity) ||
        !Number.isInteger(input.expectedVersion)
      )
        return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
      body = JSON.stringify({
        quantity: input.quantity,
        expectedVersion: input.expectedVersion,
      });
      headers["Content-Type"] = "application/json";
    } else {
      const version = new URL(request.url).searchParams.get("expectedVersion");
      if (!version || !/^\d+$/.test(version))
        return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
      path += `?expectedVersion=${version}`;
    }
    const response = await api(path, { method, headers, body }, token);
    return new Response(method === "DELETE" ? null : response.body, {
      status: response.status,
      headers: {
        ...privateHeaders,
        ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PUT(
  request: Request,
  ctx: { params: Promise<{ variantId: string }> },
) {
  return mutate(request, (await ctx.params).variantId, "PUT");
}
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ variantId: string }> },
) {
  return mutate(request, (await ctx.params).variantId, "DELETE");
}
