import { getSession } from "@/lib/session";
import { privateHeaders } from "@/lib/origin";
export async function GET() {
  return Response.json(
    { account: (await getSession())?.account ?? null },
    { headers: privateHeaders },
  );
}
