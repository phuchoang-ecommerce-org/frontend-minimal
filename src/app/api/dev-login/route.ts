import { api, errorResponse } from "@/lib/api";
import { config } from "@/lib/config";
import { denied, privateHeaders, sameOrigin } from "@/lib/origin";
import { setSession } from "@/lib/session";
import type { LoginResult } from "@/lib/types";

const credentials = {
  MEMBER: ["DEV_MEMBER_LOGIN", "DEV_MEMBER_PASSWORD"],
  SELLER: ["DEV_SELLER_LOGIN", "DEV_SELLER_PASSWORD"],
  ADMIN: ["DEV_ADMIN_LOGIN", "DEV_ADMIN_PASSWORD"],
} as const;

export async function POST(request: Request) {
  if (config().profile !== "dev") return new Response(null, { status: 404 });
  if (!sameOrigin(request)) return denied();
  const hostname = new URL(request.url).hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") return denied();
  let role: keyof typeof credentials;
  try {
    const body = await request.json();
    if (!body || typeof body.role !== "string" || !Object.hasOwn(credentials, body.role))
      return Response.json({ code: "INVALID_REQUEST" }, { status: 400, headers: privateHeaders });
    role = body.role as keyof typeof credentials;
  } catch {
    return Response.json({ code: "INVALID_REQUEST" }, { status: 400, headers: privateHeaders });
  }
  const [loginKey, passwordKey] = credentials[role];
  const login = process.env[loginKey];
  const password = process.env[passwordKey];
  if (!login || !password)
    return Response.json({ code: "DEV_ACCOUNT_NOT_CONFIGURED" }, { status: 503, headers: privateHeaders });
  try {
    const guest = request.headers.get("cookie")?.match(/(?:^|;\s*)guest_cart=([^;]*)/)?.[1];
    const response = await api("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: new URL(request.url).origin,
        ...(guest ? { Cookie: `guest_cart=${guest}` } : {}),
      },
      body: JSON.stringify({ login, password }),
    });
    const result = await response.json() as LoginResult;
    if (result.account.role !== role)
      return Response.json({ code: "DEV_ROLE_MISMATCH" }, { status: 503, headers: privateHeaders });
    await setSession(result.accessToken, result.account, result.expiresInSeconds);
    const output = Response.json({ account: result.account, cartMerge: result.cartMerge }, { headers: privateHeaders });
    if (response.headers.get("set-cookie")?.startsWith("guest_cart="))
      output.headers.append("Set-Cookie", response.headers.get("set-cookie")!);
    return output;
  } catch (error) {
    return errorResponse(error);
  }
}
