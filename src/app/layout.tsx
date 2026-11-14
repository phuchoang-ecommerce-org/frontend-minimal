import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import "./globals.css";
export const metadata: Metadata = {
  title: "Market",
  description: "Browse products and build a marketplace cart",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          {children}
          <footer className="border-t border-line bg-paper px-5 py-8 text-center text-sm text-sage">
            Market · Independent finds, delivered with care
          </footer>
        </Providers>
      </body>
    </html>
  );
}
