/**
 * Cache-busting version for static media served from /public.
 *
 * Video files ship under stable names (`/videos/hero-2.mp4`) and are served
 * with `Cache-Control: immutable, max-age=31536000`. That pairing is a trap:
 * when the bytes behind a stable name change — as they did when the hero
 * masters were re-encoded — every previous visitor keeps serving the old file
 * from disk for a year, and never sees the fix.
 *
 * Appending a version token makes the URL itself change with the content, so
 * the long immutable TTL stays valid (a given URL really never changes) while
 * new bytes are picked up immediately.
 *
 * BUMP THIS whenever a file under /public/videos is re-encoded or replaced.
 */
export const MEDIA_VERSION = "3";

/** Append the media version to a local /public asset URL. */
export function versionedMedia(src: string): string {
  // Leave absolute/remote URLs and data URIs untouched.
  if (!src.startsWith("/")) return src;
  if (src.includes("?")) return `${src}&v=${MEDIA_VERSION}`;
  return `${src}?v=${MEDIA_VERSION}`;
}
