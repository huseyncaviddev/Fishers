import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ProductsContent } from "@/components/sections/ProductsContent";

export const metadata: Metadata = {
  title: "Məhsullar | United Fishers",
  description:
    "United Fishers akvakultura məhsulları — premium balıq, kürü, yem və texnoloji həllər.",
};

export default function ProductsPage() {
  return (
    <>
      <PageHero pageKey="products" image="/images/10.jpg" />
      <ProductsContent />
    </>
  );
}
