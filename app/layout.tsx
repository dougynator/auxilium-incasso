import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CookieBanner from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auxilium Incasso - Professioneel incassobureau",
  description: "Professioneel incassobureau voor snelle en efficiënte incasso",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {children}
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}

