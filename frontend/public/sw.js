// Service Worker for Carbonate Chat App

const CACHE_NAME = 'carbonate-cache-v1';
const STATIC_CACHE_NAME = 'carbonate-static-v1';
const DYNAMIC_CACHE_NAME = 'carbonate-dynamic-v1';

// Assets to cache immediately on service worker install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/avatar.png',
  '/assets/index-D7t-Qy2v.css',
  '/assets/index-bFosQAJ3.js'
];

// Install a service worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching App Shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME
            ) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Cache and return requests with network fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and API calls
  if (
    event.request.url.indexOf('/api/') !== -1 ||
    event.request.url.indexOf('/socket.io/') !== -1
  ) {
    console.log('[Service Worker] Skipping cache for:', event.request.url);
    return;
  }

  console.log('[Service Worker] Fetching resource:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('[Service Worker] Returning from cache:', event.request.url);
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              console.log('[Service Worker] Invalid response for:', event.request.url);
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                console.log('[Service Worker] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            console.log('[Service Worker] Fetch failed:', err);
            // You could return a custom offline page here
          });
      })
  );
});
