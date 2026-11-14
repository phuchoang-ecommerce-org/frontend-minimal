import { api, errorResponse } from "@/lib/api";
import { setSession } from "@/lib/session";
import { denied, privateHeaders, sameOrigin } from "@/lib/origin";
import type { LoginResult } from "@/lib/types";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return denied();
  try {
    const body = await request.json();
    if (typeof body.login !== "string" || typeof body.password !== "string")
      return Response.json({ code: "INVALID_REQUEST" }, { status: 400 });
    const guest = request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)guest_cart=([^;]*)/)?.[1];
    const response = await api("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: new URL(request.url).origin,
        ...(guest ? { Cookie: `guest_cart=${guest}` } : {}),
      },
      body: JSON.stringify({ login: body.login, password: body.password }),
    });
    const result = (await response.json()) as LoginResult;
    await setSession(
      result.accessToken,
      result.account,
      result.expiresInSeconds,
    );
    const output = Response.json(
      { account: result.account, cartMerge: result.cartMerge },
      { headers: privateHeaders },
    );
    if (response.headers.get("set-cookie")?.startsWith("guest_cart="))
      output.headers.append("Set-Cookie", response.headers.get("set-cookie")!);
    return output;
  } catch (error) {
    return errorResponse(error);
  }
}
