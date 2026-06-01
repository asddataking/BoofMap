/// BoofMap service worker — offline shell only (never cache Next.js bundles)
const CACHE_VERSION = "boofmap-v3";
const SHELL_CACHE = "boofmap-shell-v3";

const SHELL_URLS = [
  "/offline",
  "/manifest.json",
  "/boofmaplogo.png",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
  "/apple-touch-icon.png",
];

async function safeCachePut(cache, request, response) {
  try {
    await cache.put(request, response);
  } catch {
    /* quota, truncated body, or opaque response — skip */
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            /* skip unreachable shell URLs during install */
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("boofmap-") && k !== SHELL_CACHE && k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js build output — hashed filenames change every deploy.
  if (url.pathname.startsWith("/_next/")) return;

  // Navigation: network first, offline fallback (do not cache HTML — avoids stale app shells)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const offline = await caches.match("/offline");
        if (offline) return offline;
        return new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })
    );
    return;
  }

  // PWA icons only — cache-first for install assets
  if (url.pathname.startsWith("/icons/") || url.pathname === "/apple-touch-icon.png") {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await safeCachePut(cache, request, response.clone());
        return response;
      })
    );
  }
});
