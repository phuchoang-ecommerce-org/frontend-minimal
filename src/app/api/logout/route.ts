import { clearSession } from "@/lib/session";
import { denied, privateHeaders, sameOrigin } from "@/lib/origin";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return denied();
  await clearSession();
  return Response.json({ ok: true }, { headers: privateHeaders });
}
