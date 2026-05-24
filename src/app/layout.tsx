import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fishers | Premium Aquaculture & Fishing Farm",
  description:
    "Sustainable aquaculture solutions delivering the highest quality seafood. Modern fish farming with environmental responsibility at our core.",
  keywords: [
    "aquaculture",
    "fish farm",
    "sustainable fishing",
    "seafood",
    "balıqçılıq",
  ],
  openGraph: {
    title: "Fishers | Premium Aquaculture & Fishing Farm",
    description:
      "Sustainable aquaculture solutions delivering the highest quality seafood.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <LoadingScreen />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
