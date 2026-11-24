// Офлайн-кеш «Моїх звичок»: сторінку беремо з мережі (свіжа версія), а без інтернету — з кешу
const CACHE = 'habits-v1.4.3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // Dropbox — завжди напряму
  if (u.pathname.endsWith('version.json')) return; // перевірка версії — завжди з мережі
  e.respondWith(caches.open(CACHE).then(async c => {
    try {
      const r = await fetch(e.request, {cache: 'no-store'});
      if (r.ok) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await c.match(e.request, {ignoreSearch: true})) || (await c.match('./index.html')) || Response.error();
    }
  }));
});
