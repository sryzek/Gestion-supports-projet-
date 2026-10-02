const CACHE_NAME = 'gold-suite-cache-v1';
const URLS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './GOLD_FicheProjet.html',
  './GOLD_FeuilleDeRoute.html',
  './GOLD_FicheMeteo.html',
  './GOLD_Planning.html',
  './GOLD_RACI.html',
  './GOLD_Conges.html'
];

// À l'installation, on met tous les fichiers en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Fichiers mis en cache avec succès');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches si changement de version
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseaux
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si le fichier est dans le cache, on le retourne directement
        if (response) {
          return response;
        }
        // Sinon, on tente de le récupérer sur le réseau
        return fetch(event.request).then(
          function(networkResponse) {
            // Si la requête échoue ou n'est pas valide, on ne fait rien de spécial
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Sinon, on clone la réponse et on la met en cache pour la prochaine fois
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
  );
});