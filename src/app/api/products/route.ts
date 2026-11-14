import { api, errorResponse } from "@/lib/api";
export async function GET(request: Request) {
  try {
    const query = new URL(request.url).search;
    const response = await api(`/products${query}`);
    return new Response(response.body, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
