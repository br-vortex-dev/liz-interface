// Bump obrigatório a cada mudança em assets: o cache é cache-first.
// v6: bump para forçar atualização em navegadores com SW antigo em cache (corrige assets obsoletos, ex: selects brancos).
const CACHE_NAME = 'liz-chat-v6';
const STATIC_ASSETS = [
  './',
  './index.html',
  './coroa.svg',
  './css/base.css',
  './css/accessibility.css',
  './css/animations.css',
  './css/layout.css',
  './css/theme.css',
  './css/header.css',
  './css/menu.css',
  './css/chat.css',
  './css/panels.css',
  './css/settings.css',
  './css/gallery.css',
  './css/mural.css',
  './css/focus-mode.css',
  './css/intro.css',
  './css/responsive.css',
  './js/config.js',
  './js/data.js',
  './js/api.js',
  './js/ui-core.js',
  './js/ui-chat.js',
  './js/ui-panels.js',
  './js/ui-gallery.js',
  './js/mural.js',
  './js/settings.js',
  './js/chat.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // API requests sempre vão pra rede (sem cache)
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Static assets: cache-first com fallback pra rede
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => {
      // Offline: retorna a shell da app
      return caches.match('./index.html');
    })
  );
});
