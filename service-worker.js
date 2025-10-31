const CACHE_NAME = 'weatherease-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/weather.html',
  '/settings.html',
  '/exit.html',
  '/style.css',
  '/script.js',
  '/voice-control.js',
  '/voice-control-weather.js',
  '/manifest.json',
  '/icons/weather-192.png',
  '/icons/weather-512.png'
];

// Install: cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy for app files, network-first for API
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // OpenWeatherMap API requests
  if (url.hostname.includes('api.openweathermap.org')) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          const clonedResp = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clonedResp));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Other requests: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
