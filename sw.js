// Service Worker pour LYNA PWA
const CACHE_NAME = 'lyna-pwa-v3'; // Version bumpée
const urlsToCache = [
  '/',
  '/index.html',
];

// Installation du SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  // Ignorer les appels API Supabase (toujours réseau)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Stratégie de navigation pour SPA : toujours renvoyer index.html pour les navigations de page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html').catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Stratégie Network First pour le reste
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});