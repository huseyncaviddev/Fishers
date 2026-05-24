import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import { PageHero } from "@/components/ui/PageHero";
import { ProductDetail } from "@/components/sections/ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | Fishers`,
    description: product.shortDesc,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <PageHero
        title={product.name}
        subtitle={product.shortDesc}
        image={product.image}
      />
      <ProductDetail product={product} />
    </>
  );
}
