const CACHE_NAME = 'gold-suite-v1.15';

const ASSETS = [
  './',
  './index.html',
  './GOLD_FicheProjet.html',
  './GOLD_FeuilleDeRoute.html',
  './GOLD_FicheMeteo.html',
  './GOLD_Planning.html',
  './GOLD_RACI.html',
  './GOLD_Conges.html',
  './GOLD_Vigie.html',
  './manifest.json',
  './icon.png'
];

// 1. Installation : mise en cache des fichiers de la suite GOLD et activation immédiate
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Activation : nettoyage automatique des anciens caches (v1.14 et précédents)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Interception des requêtes : Stratégie "Network First" (Réseau en priorité, Cache si hors-ligne)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
