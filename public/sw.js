// Gallop Learning Academy — lightweight service worker
// Static assets: stale-while-revalidate. API: always network (never cache learning data).
const CACHE = 'gallop-v39';
const STATIC = ['/', '/index.html', '/styles.css', '/app.js', '/games.js', '/curriculum.js', '/lessons.js', '/lessons_patch.js', '/manifest.json', '/icon-192.png', '/icon-512.png', '/logo-mark.png', '/logo-roundel.png', '/logo-full.png', '/logo-full-dark.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api')) return; // network only
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res.ok && url.origin === location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
