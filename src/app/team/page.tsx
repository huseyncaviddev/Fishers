import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { TeamContent } from "@/components/sections/TeamContent";

export const metadata: Metadata = {
  title: "Komanda | United Fishers",
  description:
    "United Fishers komandası — rəhbərlik, mütəxəssislər və peşəkar əməkdaşlarımız haqqında məlumat.",
};

export default function TeamPage() {
  return (
    <>
      <PageHero pageKey="team" image="/images/4.jpg" />
      <TeamContent />
    </>
  );
}
