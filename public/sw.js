// Minimal service worker: exists only to satisfy PWA installability checks.
// Deliberately does no caching - price data must always come from the network,
// never a stale cache.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
