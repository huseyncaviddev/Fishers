import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ContactContent } from "@/components/sections/ContactContent";

export const metadata: Metadata = {
  title: "Əlaqə | Fishers",
  description:
    "Fishers ilə əlaqə saxlayın — ünvan, telefon, e-poçt və əlaqə formu.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="Əlaqə"
        subtitle="Suallarınız və təklifləriniz üçün bizimlə əlaqə saxlayın"
        image="/images/6.jpg"
      />
      <ContactContent />
    </>
  );
}
