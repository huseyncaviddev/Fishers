import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/ui/PageHero";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = pageMetadata({
  title: "Əlaqə",
  description:
    "United Fishers ilə əlaqə saxlayın — ünvan, telefon, e-poçt və əlaqə formu.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHero pageKey="contact" image="/images/6.jpg" />
      <ContactContent />
    </>
  );
}
