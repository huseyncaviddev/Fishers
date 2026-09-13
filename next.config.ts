import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// Vercel injects its preview toolbar from vercel.live on preview deployments
// only; production never loads it, so production keeps the strict list.
const isVercelPreview = process.env.VERCEL_ENV === "preview";

/**
 * Content-Security-Policy assembled from what the site actually loads:
 *  - scripts/styles: Next.js emits inline hydration scripts and Framer Motion
 *    writes inline styles, so both need 'unsafe-inline' (a nonce would require
 *    dynamic rendering of every page; this site is fully static).
 *  - images/media/fonts: all self-hosted (next/font, /images, /videos).
 *  - frames: the Google Maps embed on the contact pages.
 *  - workers: the service worker at /sw.js.
 * Everything else — plugins, foreign frames embedding this site, foreign form
 * targets, <base> hijacking — is closed.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${isVercelPreview ? " https://vercel.live" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}${isVercelPreview ? " https://vercel.live wss://ws-us3.pusher.com" : ""}`,
  `frame-src https://maps.google.com https://www.google.com${isVercelPreview ? " https://vercel.live" : ""}`,
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy equivalent of frame-ancestors for browsers without CSP support.
  { key: "X-Frame-Options", value: "DENY" },
  // The legacy XSS auditor is disabled: modern browsers removed it and in old
  // ones it could itself be abused; CSP is the real control.
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 31536000,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  // Security headers live here (not only in vercel.json) so a local
  // `next start` serves exactly what production serves and can be verified
  // before a deploy. Long-lived cache headers for static media stay in
  // vercel.json because they describe the platform's static file serving.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
