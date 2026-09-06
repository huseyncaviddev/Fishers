import { PRODUCTS } from "@/data/products";
import type { Dictionary } from "@/i18n";

export interface SearchResult {
  href: string;
  title: string;
  /** Short line under the title — the section or product summary. */
  detail: string;
  /** Section label shown as an eyebrow, e.g. "Məhsullar". */
  group: string;
}

/**
 * Everything the search box can find, built from the content this site already
 * ships: the routes and the product catalogue, titled in the active locale.
 *
 * Deliberately local. There is no search backend to call and inventing one
 * would mean inventing credentials, so the index is derived from the same
 * dictionary that renders the pages — which also means it translates for free
 * and can never drift out of sync with what a visitor can actually navigate to.
 */
function buildIndex(t: Dictionary): SearchResult[] {
  const p = t.pages;
  const pages: SearchResult[] = [
    { href: "/", title: t.common.home, detail: t.brand.tagline, group: t.nav.navigationGroup },
    { href: "/about", title: p.about.title, detail: p.about.subtitle, group: t.nav.navigationGroup },
    { href: "/products", title: p.products.title, detail: p.products.subtitle, group: t.nav.navigationGroup },
    { href: "/gallery", title: p.gallery.title, detail: p.gallery.subtitle, group: t.nav.navigationGroup },
    { href: "/team", title: p.team.title, detail: p.team.subtitle, group: t.nav.navigationGroup },
    { href: "/contact", title: p.contact.title, detail: p.contact.subtitle, group: t.nav.navigationGroup },
  ];

  const products: SearchResult[] = PRODUCTS.map((p) => {
    const item = t.products.items[p.slug];
    return {
      href: `/products/${p.slug}`,
      title: item.name,
      detail: item.type,
      group: t.nav.products,
    };
  });

  return [...pages, ...products];
}

/**
 * Fold case and strip Azerbaijani/Russian diacritics so that "kuru" finds
 * "kürü" and "nere" finds "nərə". Without this the search is unusable for
 * anyone typing on a keyboard without the local layout.
 */
function fold(s: string): string {
  return s
    .toLocaleLowerCase("az")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

const MAX_RESULTS = 8;

export function searchSite(query: string, t: Dictionary): SearchResult[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];

  const scored: Array<{ r: SearchResult; score: number }> = [];
  for (const r of buildIndex(t)) {
    const title = fold(r.title);
    const detail = fold(r.detail);
    // A title match is worth more than a description match, and a match at the
    // start of the title more than one in the middle.
    let score = 0;
    if (title.startsWith(q)) score = 3;
    else if (title.includes(q)) score = 2;
    else if (detail.includes(q)) score = 1;
    if (score > 0) scored.push({ r, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.r.title.localeCompare(b.r.title))
    .slice(0, MAX_RESULTS)
    .map((s) => s.r);
}
