import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import { az } from "@/i18n/translations/az";
import { pageMetadata } from "@/lib/site";
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
  const item = az.products.items[product.slug];
  return pageMetadata({
    title: item.name,
    description: item.shortDesc,
    path: `/products/${product.slug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <PageHero productSlug={product.slug} image={product.image} />
      <ProductDetail product={product} />
    </>
  );
}
