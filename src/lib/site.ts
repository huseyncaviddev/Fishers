import type { Metadata } from "next";

/**
 * One authoritative production origin. Every absolute URL the site emits —
 * canonical links, Open Graph, the sitemap, robots.txt, JSON-LD — derives from
 * here so the crawl surface can never point at a stale or mismatched host.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.united-fishers.com"
).replace(/\/+$/, "");

export const SITE_NAME = "United Fishers";

interface PageMeta {
  title: string;
  description: string;
  /** Route path starting with "/" — becomes the canonical and og:url. */
  path: string;
}

/**
 * Per-route metadata with a self-referencing canonical and matching Open Graph
 * fields. Without this every page inherited the root layout's og:url/og:title,
 * so social previews and crawlers saw the homepage identity on every route and
 * no canonical at all.
 */
export function pageMetadata({ title, description, path }: PageMeta): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
    },
    twitter: {
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}
