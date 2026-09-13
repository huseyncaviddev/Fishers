import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import { PageHero } from "@/components/ui/PageHero";
import { ProductsContent } from "@/components/sections/ProductsContent";

export const metadata: Metadata = pageMetadata({
  title: "Məhsullar",
  description:
    "United Fishers akvakultura məhsulları — premium balıq, kürü, yem və texnoloji həllər.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <PageHero pageKey="products" image="/images/10.jpg" />
      <ProductsContent />
    </>
  );
}
