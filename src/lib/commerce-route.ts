import "server-only";
import { api, errorResponse } from "./api";
import { getSession } from "./session";
import { denied, privateHeaders, sameOrigin } from "./origin";

export async function commerceRoute(
  request: Request,
  path: string,
  role: "MEMBER" | "SELLER",
  method: "GET" | "POST" = "GET",
  body?: string,
  key?: string,
) {
  if (method === "POST" && !sameOrigin(request)) return denied();
  const session = await getSession();
  if (!session)
    return Response.json(
      { code: "AUTHENTICATION_REQUIRED" },
      { status: 401, headers: privateHeaders },
    );
  if (session.account.role !== role)
    return Response.json(
      { code: "ROLE_DENIED" },
      { status: 403, headers: privateHeaders },
    );
  try {
    const response = await api(
      path,
      {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        body,
      },
      session.token,
    );
    return new Response(response.body, {
      status: response.status,
      headers: { ...privateHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
