import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { AboutContent } from "@/components/sections/AboutContent";
import aboutHero from "../../../public/images/improved/chatgpt-image-sep-6-2026-04_41_28-pm.png";

export const metadata: Metadata = {
  title: "Haqqımızda",
  description:
    "United Fishers haqqında ətraflı məlumat — missiyamız, vizyonumuz və dəyərlərimiz.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        pageKey="about"
        image={aboutHero}
        imageUnoptimized
        showGrain={false}
        imagePosition="center 36%"
        overlayClassName="bg-gradient-to-b from-navy/10 via-navy/15 to-navy/85"
        contentAlign="bottom"
        imageBlurDataURL="data:image/jpeg;base64,/9j/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAALABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwQF/8QAIRAAAgEDAwUAAAAAAAAAAAAAAQIRAAMSBAUUMWKx0eH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAv/EABYRAQEBAAAAAAAAAAAAAAAAAAAREv/aAAwDAQACEQMRAD8A0F29lsqqXwuJJjqIn1SjRXC88sEHt+1GrHNhJjNvNPcJBkE0qdP/2Q=="
      />
      <AboutContent />
    </>
  );
}
