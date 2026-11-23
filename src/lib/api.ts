import "server-only";
import { config } from "./config";
import { getSession } from "./session";
import type { Problem } from "./types";

export class ApiError extends Error {
  constructor(
    public status: number,
    public problem: Problem,
  ) {
    super(problem.code ?? problem.title ?? "API error");
  }
}
export async function api(
  path: string,
  init: RequestInit = {},
  token?: string,
  clearUnauthorized = true,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(new URL(path, config().apiUrl), {
    ...init,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    let problem: Problem = {};
    try {
      problem = await response.json();
    } catch {
      /* backend can be unavailable */
    }
    if (response.status === 401 && token && clearUnauthorized) await clearExpiredSession();
    throw new ApiError(response.status, problem);
  }
  return response;
}
async function clearExpiredSession() {
  const { clearSession } = await import("./session");
  await clearSession();
}
export async function currentToken() {
  return (await getSession())?.token;
}
export function errorResponse(error: unknown) {
  if (error instanceof ApiError)
    return Response.json(
      {
        code: error.problem.code ?? "REQUEST_FAILED",
        fieldErrors: error.problem.fieldErrors,
        correlationId: error.problem.correlationId,
      },
      {
        status: error.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  return Response.json(
    { code: "SERVICE_UNAVAILABLE" },
    { status: 503, headers: { "Cache-Control": "private, no-store" } },
  );
}
