const CACHE_NAME = 'freefy-cover-maker-v1';
const urlsToCache = [
  '/',
  '/assets/css/style.css',
  '/assets/css/toggle.css',
  '/assets/js/script.js',
  '/assets/js/unsplash.js',
  '/assets/js/color-selector.js',
  '/assets/js/analytics.js',
  '/assets/json/default-colors.json',
  '/assets/json/default-images.json',
  '/assets/images/freefy-logo-white.svg',
  '/assets/images/freefy-logo-black.svg',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});