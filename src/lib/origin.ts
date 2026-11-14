export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  return origin === expected;
}
export function denied() {
  return Response.json(
    { code: "ORIGIN_DENIED" },
    { status: 403, headers: { "Cache-Control": "private, no-store" } },
  );
}
export const privateHeaders = { "Cache-Control": "private, no-store" };
