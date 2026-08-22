export type ProductSlug =
  | "xezer-neresi"
  | "qara-kuru"
  | "alabaliq"
  | "hise-verilmis-alabaliq"
  | "premium-baliq-yemi"
  | "iot-monitorinq";

export type ProductCategoryKey = "fish" | "premium" | "feedTech";

export type CategoryFilterKey = "all" | ProductCategoryKey;

/**
 * Language-independent product structure. All human-readable text
 * (name, descriptions, specs, features, uses) lives in the i18n
 * dictionaries under `products.items[slug]`.
 */
export interface Product {
  slug: ProductSlug;
  categoryKey: ProductCategoryKey;
  image: string;
  video: string;
}

export const CATEGORY_FILTERS: CategoryFilterKey[] = [
  "all",
  "fish",
  "premium",
  "feedTech",
];

export const PRODUCTS: Product[] = [
  {
    slug: "xezer-neresi",
    categoryKey: "fish",
    image: "/images/10.jpg",
    video: "/videos/farm-1.mp4",
  },
  {
    slug: "qara-kuru",
    categoryKey: "premium",
    image: "/images/3.jpg",
    video: "/videos/farm-2.mp4",
  },
  {
    slug: "alabaliq",
    categoryKey: "fish",
    image: "/images/14.jpg",
    video: "/videos/farm-3.mp4",
  },
  {
    slug: "hise-verilmis-alabaliq",
    categoryKey: "premium",
    image: "/images/9.jpg",
    video: "/videos/farm-4.mp4",
  },
  {
    slug: "premium-baliq-yemi",
    categoryKey: "feedTech",
    image: "/images/12.jpg",
    video: "/videos/farm-5.mp4",
  },
  {
    slug: "iot-monitorinq",
    categoryKey: "feedTech",
    image: "/images/5.jpg",
    video: "/videos/farm-2.mp4",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
