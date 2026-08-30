import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { AboutPreview } from "@/components/sections/AboutPreview";

const VideoShowcase = dynamic(() =>
  import("@/components/sections/VideoShowcase").then((m) => m.VideoShowcase)
);
const Services = dynamic(() =>
  import("@/components/sections/Services").then((m) => m.Services)
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
      <AboutPreview />
      <VideoShowcase />
      <Services />
      <Stats />
      <GalleryPreview />
      <CTA />
      <ContactPreview />
    </>
  );
}
