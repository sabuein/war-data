// Service Worker for War Data Visualization PWA

const CACHE_NAME = "war-data-cache-v1";
const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/assets/css/styles.css",
    "/assets/js/app.js",
    "/assets/js/mods/data.js",
    "/assets/js/mods/i18n.js",
    "/assets/js/mods/ui.js",
    "/assets/images/icon-192x192.png",
    "/assets/images/icon-512x512.png",
    "https://cdn.jsdelivr.net/npm/chart.js",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Deleting old cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
    // Skip cross-origin requests
    if (
        !event.request.url.startsWith(self.location.origin) &&
        !event.request.url.includes("cdn.jsdelivr.net")
    ) {
        return;
    }

    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                // Cache hit - return the response from the cached version
                if (response) {
                    return response;
                }

                // Not in cache - fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Check if we received a valid response
                    if (
                        !networkResponse ||
                        networkResponse.status !== 200 ||
                        networkResponse.type !== "basic"
                    ) {
                        return networkResponse;
                    }

                    // Clone the response
                    const responseToCache = networkResponse.clone();

                    // Open the cache and put the new response there
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                });
            })
            .catch(() => {
                // If both cache and network fail, show a generic fallback
                if (event.request.url.indexOf(".html") > -1) {
                    return caches.match("/offline.html");
                }
            })
    );
});

// Handle API requests with network-first strategy
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Clone the response
                    const responseToCache = response.clone();

                    // Open the cache and put the new response there
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch(() => {
                    // If network fails, try to get it from the cache
                    return caches.match(event.request);
                })
        );
    }
});