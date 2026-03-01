const CACHE_NAME = 'epic2003-shell-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.webmanifest',
  './assets/favicon.svg',
  './assets/venue-map.svg',
  './assets/aisha-roy.webp',
  './assets/metal-shadows.webp',
  './assets/dj-blaze.webp',
  './electric_dragon_concert_hero_1772381931809.png',
  './pro_venue_map_pune_arena_1772383111373.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  const isStaticAsset = /\.(?:css|js|webp|svg|png|jpg|jpeg|gif|webmanifest)$/i.test(url.pathname);
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
