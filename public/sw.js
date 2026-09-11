// Minimal service worker: exists only to satisfy PWA installability checks.
// Deliberately does no caching - price data must always come from the network,
// never a stale cache. The fetch handler explicitly passes every request
// straight to the network rather than leaving respondWith() uncalled, so
// there's no ambiguity about this worker ever serving a cached response.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
