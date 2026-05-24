import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryContent } from "@/components/sections/GalleryContent";

export const metadata: Metadata = {
  title: "Qalereya | Fishers",
  description:
    "Fishers balıqçılıq təsərrüfatının foto və video qalereyası — istehsal proseslərimiz və infrastrukturumuz.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        title="Qalereya"
        subtitle="İstehsal proseslərimiz və müasir infrastrukturumuzla yaxından tanış olun"
        image="/images/8.jpg"
      />
      <GalleryContent />
    </>
  );
}
