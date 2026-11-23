import "server-only";
import { dehydrate, QueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "./api";

export async function hydratePrivate(token: string, reads: { key: QueryKey; path: string }[]) {
  const client = new QueryClient();
  await Promise.all(reads.map(({ key, path }) => client.prefetchQuery({
    queryKey: key,
    queryFn: async () => (await api(path, {}, token, false)).json(),
    retry: false,
  })));
  return dehydrate(client);
}
