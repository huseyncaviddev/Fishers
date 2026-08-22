import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryContent } from "@/components/sections/GalleryContent";

export const metadata: Metadata = {
  title: "Qalereya | United Fishers",
  description:
    "United Fishers balıqçılıq təsərrüfatının foto və video qalereyası — istehsal proseslərimiz və infrastrukturumuz.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero pageKey="gallery" image="/images/8.jpg" />
      <GalleryContent />
    </>
  );
}
