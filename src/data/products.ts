export type ProductSlug =
  | "ceki"
  | "ag-amur"
  | "ag-shalinali"
  | "premium-baliq-yemi"
  | "iot-monitorinq";

export type ProductCategoryKey = "fish" | "feedTech";

export type CategoryFilterKey = "all" | ProductCategoryKey;

/**
 * Language-independent product structure. All human-readable text
 * (name, descriptions, specs, features, uses) lives in the i18n
 * dictionaries under `products.items[slug]`.
 *
 * The three fish species reflect the state aquaculture certificate
 * (Şəhadətnamə AZ № 0191): common carp, grass carp and silver carp,
 * raised in Neftçala rayonu with water from the Kür river.
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
  "feedTech",
];

export const PRODUCTS: Product[] = [
  {
    slug: "ceki",
    categoryKey: "fish",
    image: "/images/improved/ChatGPT Image Sep 6, 2026, 03_53_42 PM.png",
    video: "/videos/farm-1.mp4",
  },
  {
    slug: "ag-amur",
    categoryKey: "fish",
    image: "/images/improved/ChatGPT Image Sep 6, 2026, 04_09_24 PM.png",
    video: "/videos/farm-3.mp4",
  },
  {
    slug: "ag-shalinali",
    categoryKey: "fish",
    image: "/images/improved/ChatGPT Image Sep 6, 2026, 05_03_41 PM.png",
    video: "/videos/farm-2.mp4",
  },
  {
    slug: "premium-baliq-yemi",
    categoryKey: "feedTech",
    image: "/images/improved/ChatGPT Image Sep 6, 2026, 03_35_56 PM (2).png",
    video: "/videos/farm-5.mp4",
  },
  {
    slug: "iot-monitorinq",
    categoryKey: "feedTech",
    image: "/images/improved/ChatGPT Image Sep 6, 2026, 03_22_48 PM (4).png",
    video: "/videos/farm-2.mp4",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
