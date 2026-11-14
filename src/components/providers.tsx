"use client";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <ConfigProvider
        theme={{ token: { colorPrimary: "#17645b", borderRadius: 8 } }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
