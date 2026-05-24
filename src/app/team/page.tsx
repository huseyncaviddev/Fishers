import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { TeamContent } from "@/components/sections/TeamContent";

export const metadata: Metadata = {
  title: "Komanda | Fishers",
  description:
    "Fishers komandası — rəhbərlik, mütəxəssislər və peşəkar əməkdaşlarımız haqqında məlumat.",
};

export default function TeamPage() {
  return (
    <>
      <PageHero
        title="Komanda"
        subtitle="Hər biri öz sahəsində mütəxəssis olan peşəkar komandamız"
        image="/images/4.jpg"
      />
      <TeamContent />
    </>
  );
}
