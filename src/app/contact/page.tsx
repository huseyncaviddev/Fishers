import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Əlaqə | United Fishers",
  description:
    "United Fishers ilə əlaqə saxlayın — ünvan, telefon, e-poçt və əlaqə formu.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero pageKey="contact" image="/images/6.jpg" />
      <ContactContent />
    </>
  );
}
