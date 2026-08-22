import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { ProductsPreview } from "@/components/sections/ProductsPreview";
import { AboutPreview } from "@/components/sections/AboutPreview";

const VideoShowcase = dynamic(() =>
  import("@/components/sections/VideoShowcase").then((m) => m.VideoShowcase)
);
const Services = dynamic(() =>
  import("@/components/sections/Services").then((m) => m.Services)
);
const ImageShowcase = dynamic(() =>
  import("@/components/sections/ImageShowcase").then((m) => m.ImageShowcase)
);
const Stats = dynamic(() =>
  import("@/components/sections/Stats").then((m) => m.Stats)
);
const GalleryPreview = dynamic(() =>
  import("@/components/sections/GalleryPreview").then((m) => m.GalleryPreview)
);
const CTA = dynamic(() =>
  import("@/components/sections/CTA").then((m) => m.CTA)
);
const ContactPreview = dynamic(() =>
  import("@/components/sections/ContactPreview").then((m) => m.ContactPreview)
);

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
