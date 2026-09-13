import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Generated (not a static public/robots.txt) so the sitemap pointer is always
// the same host as the sitemap and canonicals. The static file it replaces
// advertised a sitemap on an unrelated domain.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
