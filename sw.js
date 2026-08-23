// Service worker mínimo: solo para que el navegador ofrezca "Instalar app"
// y para que el shell de la app cargue offline. Nunca cachea llamadas a la
// API de GitHub (deben ir siempre a red para no leer/guardar datos viejos).
const CACHE = 'agrogest-v1.0'; // sube este número (o la versión) al publicar cambios, para forzar refresco de caché en los móviles
const ASSETS = [
  './', './index.html', './css/style.css', './js/app.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // deja pasar github.com/api.github.com sin tocar
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
