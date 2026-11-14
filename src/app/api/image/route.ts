import { api, errorResponse } from "@/lib/api";
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path");
  if (
    !path ||
    !/^\/products\/[0-9a-f-]+\/images\/[0-9a-f-]+\/content$/.test(path)
  )
    return new Response(null, { status: 404 });
  try {
    const response = await api(path);
    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
