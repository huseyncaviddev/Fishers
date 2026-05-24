import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ProductsContent } from "@/components/sections/ProductsContent";

export const metadata: Metadata = {
  title: "Məhsullar | Fishers",
  description:
    "Fishers akvakultura məhsulları — premium balıq, kürü, yem və texnoloji həllər.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        title="Məhsullar"
        subtitle="Premium akvakultura məhsulları və texnoloji həllərimiz"
        image="/images/10.jpg"
      />
      <ProductsContent />
    </>
  );
}
