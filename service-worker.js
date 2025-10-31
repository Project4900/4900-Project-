const CACHE_NAME = 'weatherease-v1';
const FILES_TO_CACHE = [
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

// Install SW and cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate SW and remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => key !== CACHE_NAME && caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Cache API responses dynamically
  if (requestUrl.hostname.includes('openweathermap.org')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request))
      )
    );
  } else {
    // Static assets: cache first
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});
