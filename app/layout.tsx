import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import CookieBanner from "@/components/cookie-banner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

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
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        {children}
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}

