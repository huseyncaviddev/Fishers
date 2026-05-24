import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AboutContent } from "@/components/sections/AboutContent";

export const metadata: Metadata = {
  title: "Haqqımızda | Fishers",
  description:
    "Fishers haqqında ətraflı məlumat — missiyamız, vizyonumuz və dəyərlərimiz.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Haqqımızda"
        subtitle="Davamlı akvakultura sahəsində innovativ həllər təqdim edən etibarlı tərəfdaşınız"
        image="/images/1.jpg"
      />
      <AboutContent />
    </>
  );
}
