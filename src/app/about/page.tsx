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
      <PageHero
        pageKey="about"
        image="/images/team-hero.jpg"
        imagePosition="center 36%"
        overlayClassName="bg-gradient-to-b from-navy/40 via-navy/30 to-navy/90"
        contentAlign="bottom"
        imageBlurDataURL="data:image/jpeg;base64,/9j/2wBDABQUFBQVFBcZGRcfIh4iHy4rJycrLkYyNjI2MkZqQk5CQk5Cal5yXVZdcl6phXZ2hanDpJukw+zT0+z/////////2wBDARQUFBQVFBcZGRcfIh4iHy4rJycrLkYyNjI2MkZqQk5CQk5Cal5yXVZdcl6phXZ2hanDpJukw+zT0+z/////////wgARCAAMABADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAwIE/8QAFAEBAAAAAAAAAAAAAAAAAAAAAv/aAAwDAQACEAMQAAAAGdjFf//EAB4QAAIBBQADAAAAAAAAAAAAAAECAAMEERIhMTJR/9oACAEBAAE/AEubkJ6sc+OSvXuwndlXrEy3bRHqADaE7Fh9Vjmf/8QAFhEBAQEAAAAAAAAAAAAAAAAAAQIA/9oACAECAQE/AKVp3//EABcRAQADAAAAAAAAAAAAAAAAAAEAAhH/2gAIAQMBAT8AqGE//9k="
      />
      <AboutContent />
    </>
  );
}
