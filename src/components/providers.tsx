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
        theme={{ token: { colorPrimary: "#214b3f", colorPrimaryHover: "#17382f", colorText: "#24352e", colorTextSecondary: "#68766d", colorBorder: "#dedfd8", colorBgContainer: "#fffefb", borderRadius: 6, controlHeight: 44 } }}
      >
        {children}
      </ConfigProvider>
    </QueryClientProvider>
  );
}
