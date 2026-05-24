import { Hero } from "@/components/sections/Hero";
import { ProductsPreview } from "@/components/sections/ProductsPreview";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { VideoShowcase } from "@/components/sections/VideoShowcase";
import { Services } from "@/components/sections/Services";
import { ImageShowcase } from "@/components/sections/ImageShowcase";
import { Stats } from "@/components/sections/Stats";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { CTA } from "@/components/sections/CTA";
import { ContactPreview } from "@/components/sections/ContactPreview";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductsPreview />
      <AboutPreview />
      <VideoShowcase />
      <Services />
      <ImageShowcase />
      <Stats />
      <GalleryPreview />
      <CTA />
      <ContactPreview />
    </>
  );
}
