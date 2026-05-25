import type { Metadata, Viewport } from "next";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishers.az";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c2340",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Fishers | Premium Aquaculture & Fishing Farm",
    template: "%s | Fishers",
  },
  description:
    "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları. Müasir balıqçılıq təsərrüfatı, ekoloji məsuliyyət əsasında.",
  keywords: [
    "aquaculture",
    "fish farm",
    "sustainable fishing",
    "seafood",
    "balıqçılıq",
    "akvakultura",
    "nərə",
    "alabalıq",
    "qara kürü",
    "Fishers Azerbaijan",
    "davamlı balıqçılıq",
    "RAS texnologiyası",
  ],
  authors: [{ name: "Fishers" }],
  creator: "Fishers",
  publisher: "Fishers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Fishers | Premium Aquaculture & Fishing Farm",
    description:
      "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
    url: SITE_URL,
    siteName: "Fishers",
    locale: "az_AZ",
    type: "website",
    images: [
      {
        url: "/images/1.jpg",
        width: 1200,
        height: 630,
        alt: "Fishers Aquaculture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fishers | Premium Aquaculture & Fishing Farm",
    description:
      "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
    images: ["/images/1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fishers",
  description:
    "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/7.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bakı",
    addressRegion: "Nərimanov",
    addressCountry: "AZ",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+994-12-345-67-89",
    contactType: "customer service",
    areaServed: "AZ",
    availableLanguage: ["az", "en"],
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
