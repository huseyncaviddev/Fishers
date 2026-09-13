import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/ui/AppShell";
import { I18nProvider } from "@/i18n/I18nProvider";
import { SITE_URL } from "@/lib/site";
import { configuredSocials } from "@/lib/socialIcons";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Matches --color-deep-900 / --color-navy in the marine palette; the previous
  // value was the pre-refresh deep tone and no longer appears anywhere.
  themeColor: "#071d26",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "United Fishers | Premium Aquaculture & Fishing Farm",
    template: "%s | United Fishers",
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
    "United Fishers Azerbaijan",
    "davamlı balıqçılıq",
    "RAS texnologiyası",
  ],
  authors: [{ name: "United Fishers" }],
  creator: "United Fishers",
  publisher: "United Fishers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Self-referencing canonical for the homepage; every other route sets its
  // own via `pageMetadata` so no URL is left without one.
  alternates: { canonical: "/" },
  openGraph: {
    title: "United Fishers | Premium Aquaculture & Fishing Farm",
    description:
      "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
    url: SITE_URL,
    siteName: "United Fishers",
    locale: "az_AZ",
    type: "website",
    images: [
      {
        url: "/images/chatgpt-image-sep-6-2026-05_34_16-pm.png",
        width: 1675,
        height: 939,
        alt: "United Fishers Aquaculture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "United Fishers | Premium Aquaculture & Fishing Farm",
    description:
      "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
    images: ["/images/chatgpt-image-sep-6-2026-05_34_16-pm.png"],
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "United Fishers",
  description:
    "Davamlı akvakultura həlləri — ən yüksək keyfiyyətli dəniz məhsulları.",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Neftçala",
    addressRegion: "Neftçala",
    addressCountry: "AZ",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+994-51-911-55-11",
    email: "azerbaijanaquaculture@gmail.com",
    contactType: "customer service",
    areaServed: "AZ",
    availableLanguage: ["az", "en"],
  },
  // Only profile pages count as "same entity" — WhatsApp is a messaging link.
  sameAs: configuredSocials()
    .filter((s) => s.key !== "whatsapp")
    .map((s) => s.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={GeistSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* No loading veil: the hero poster is preloaded and paints with the
          first frame, so an artificial overlay could only ever delay the very
          content it was pretending to wait for. */}
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Əsas məzmuna keç
        </a>
        <AppShell />
        <I18nProvider>
          <Navbar />
          <main id="main" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
