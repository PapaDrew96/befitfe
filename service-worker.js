'use strict';

const CACHE_NAME = 'befit-shell-v14';

const APP_SHELL = [
  './index.html',
  './manifest.webmanifest?v=14',
  './assets/css/style.css?v=14',
  './assets/js/config.js?v=14',
  './assets/js/i18n.js?v=14',
  './assets/js/api.js?v=14',
  './assets/js/app.js?v=14',
  './assets/img/logo1.png?v=14',
  './assets/img/icon-192.png?v=14',
  './assets/img/icon-512.png?v=14'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Never cache API responses. Bookings, capacity, payments and auth must stay live.
  if (url.pathname.includes('/api/v1/')) {
    return;
  }

  // Let the browser/CDN handle third-party resources.
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML/navigation: network first so deployments are picked up immediately.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put('./index.html', clone);
            });
          }

          return response;
        })
        .catch(() => caches.match('./index.html'))
    );

    return;
  }

  // Versioned/static same-origin assets: cache first.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(request).then(response => {
        if (!response || !response.ok) {
          return response;
        }

        const clone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, clone);
        });

        return response;
      });
    })
  );
});
