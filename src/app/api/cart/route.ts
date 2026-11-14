import { api, currentToken, errorResponse } from "@/lib/api";
import { privateHeaders } from "@/lib/origin";
export async function GET(request: Request) {
  try {
    const token = await currentToken();
    const guest = request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)guest_cart=([^;]*)/)?.[1];
    const response = await api(
      "/cart",
      { headers: guest && !token ? { Cookie: `guest_cart=${guest}` } : {} },
      token,
    );
    const output = new Response(response.body, {
      status: response.status,
      headers: { ...privateHeaders, "Content-Type": "application/json" },
    });
    if (response.headers.get("set-cookie")?.startsWith("guest_cart="))
      output.headers.append("Set-Cookie", response.headers.get("set-cookie")!);
    return output;
  } catch (error) {
    return errorResponse(error);
  }
}
