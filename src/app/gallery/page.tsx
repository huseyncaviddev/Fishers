import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/ui/PageHero";
import { GalleryContent } from "@/components/sections/GalleryContent";

export const metadata: Metadata = pageMetadata({
  title: "Qalereya",
  description:
    "United Fishers balıqçılıq təsərrüfatının foto və video qalereyası — istehsal proseslərimiz və infrastrukturumuz.",
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <>
      <PageHero pageKey="gallery" image="/images/8.jpg" />
      <GalleryContent />
    </>
  );
}
