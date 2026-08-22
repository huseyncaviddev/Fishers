/* Fishers service worker: app-shell + poster cache. Videos always bypass cache. */
const VERSION = "v1";
const STATIC_CACHE = `fishers-static-${VERSION}`;
const IMAGE_CACHE = `fishers-images-${VERSION}`;
const HTML_CACHE = `fishers-html-${VERSION}`;

const SHELL_URLS = ["/", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((u) =>
            cache.add(u).catch(() => {
              /* ignore missing shell entries */
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.endsWith(VERSION) === false)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isVideoRequest(req) {
  return (
    req.destination === "video" ||
    /\.(mp4|webm|m3u8|ts|mov)(\?|$)/i.test(req.url)
  );
}

function isImageRequest(req) {
  if (req.destination === "image") return true;
  return /\.(png|jpe?g|gif|webp|avif|svg|ico)(\?|$)/i.test(req.url);
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/videos/") === false &&
      /\.(css|js|woff2?|ttf|otf)$/i.test(url.pathname)
  );
}

function isHtmlRequest(req) {
  return req.mode === "navigate" || req.destination === "document";
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type === "basic") {
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res && res.ok && res.type === "basic") {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirstHtml(req) {
  const cache = await caches.open(HTML_CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req);
    if (cached) return cached;
    const shell = await caches.match("/");
    if (shell) return shell;
    const offline = await caches.match("/offline.html");
    if (offline) return offline;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never handle video — let browser range-request directly.
  if (isVideoRequest(req)) return;

  if (isImageRequest(req)) {
    event.respondWith(cacheFirst(req, IMAGE_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  if (isHtmlRequest(req)) {
    event.respondWith(networkFirstHtml(req));
    return;
  }

  // Everything else: stale-while-revalidate best effort
  event.respondWith(staleWhileRevalidate(req, STATIC_CACHE));
});
