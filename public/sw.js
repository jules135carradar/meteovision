// Cache versionné — changer ce nom force la mise à jour sur tous les appareils
const STATIC_CACHE = "meteovision-static-v2";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  // On ne pré-cache PAS les pages HTML (elles changent à chaque déploiement)
  // On pré-cache uniquement la page offline de secours
  e.waitUntil(caches.open(STATIC_CACHE).then(() => Promise.resolve()));
});

self.addEventListener("activate", (e) => {
  // Supprimer tous les anciens caches
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // Jamais mettre en cache les appels API
  if (url.pathname.startsWith("/api/")) return;

  // Fichiers statiques Next.js : cache-first (les noms contiennent un hash, donc immuables)
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(e.request).then((cached) => {
          if (cached) return cached;
          return fetch(e.request).then((res) => {
            cache.put(e.request, res.clone());
            return res;
          });
        })
      )
    );
    return;
  }

  // Pages HTML et tout le reste : network-first, sans mise en cache
  // → l'appli installée reçoit toujours la dernière version du serveur
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
