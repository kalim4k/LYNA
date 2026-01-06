// Service Worker pour LYNA PWA
const CACHE_NAME = 'lyna-pwa-v2'; // Version bumpée pour forcer la mise à jour
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

// Interception des requêtes (Stratégie: Network First, fallback to Cache)
self.addEventListener('fetch', (event) => {
  // On ne met pas en cache les appels API Supabase pour avoir toujours la data fraîche
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse pour la mettre en cache si c'est une requête valide
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
        // Si pas de réseau, on essaie le cache
        return caches.match(event.request);
      })
  );
});