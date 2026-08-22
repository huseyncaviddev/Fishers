import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AboutContent } from "@/components/sections/AboutContent";

export const metadata: Metadata = {
  title: "Haqqımızda | United Fishers",
  description:
    "United Fishers haqqında ətraflı məlumat — missiyamız, vizyonumuz və dəyərlərimiz.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero pageKey="about" image="/images/1.jpg" />
      <AboutContent />
    </>
  );
}
