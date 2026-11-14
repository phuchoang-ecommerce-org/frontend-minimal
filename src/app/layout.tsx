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
      <body>
        <Providers>
          <Header />
          {children}
          <footer className="site-footer">
            Market · Cash on delivery marketplace
          </footer>
        </Providers>
      </body>
    </html>
  );
}
