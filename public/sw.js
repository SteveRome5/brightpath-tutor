// Gallop Learning Academy — service worker
// GOAL: every ONLINE device always runs the LATEST deployed code — no stale caches, no version
// fragmentation across devices — while still working offline. Strategy:
//   • App code (navigations, HTML/JS/CSS): NETWORK-FIRST with a short timeout. Fresh when online;
//     cache is only a fallback for offline / very slow networks. This keeps every device on the
//     same, newest build without needing a manual cache-version bump on each deploy.
//   • Other static assets (images, icons, manifest): stale-while-revalidate (instant + refreshed
//     in the background) since they're heavy and rarely change.
//   • API (/api/*): never touched — always live network (never cache learning data).
const CACHE = 'gallop-v194';
const STATIC = ['/', '/index.html', '/styles.css', '/app.js', '/games.js', '/curriculum.js', '/careers.js', '/lessons.js', '/lessons_patch.js', '/lessons_ext.js', '/manifest.json', '/icon-192.png', '/icon-512.png', '/logo-mark.png', '/logo-roundel.png', '/logo-full.png', '/logo-full-dark.png', '/favicon-32.png', '/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Resolve with the network response, or reject after `ms` so a slow/broken connection can't hang
// the page — we then fall back to whatever is cached.
function timedFetch(req, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    fetch(req).then(r => { clearTimeout(t); resolve(r); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api')) return;   // network only, never cached
  if (url.origin !== location.origin) return;                                  // let cross-origin (CDN) pass through

  const isCode = e.request.mode === 'navigate' || url.pathname === '/' || /\.(js|css|html)$/.test(url.pathname);

  if (isCode) {
    // NETWORK-FIRST: always try to serve the freshest code so no device sits on a stale build.
    e.respondWith((async () => {
      try {
        const res = await timedFetch(e.request, 3500);
        if (res && res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return res;
      } catch (err) {
        const cached = await caches.match(e.request);
        return cached || (await caches.match('/index.html')) || Response.error();
      }
    })());
  } else {
    // STALE-WHILE-REVALIDATE for images / manifest / icons: instant from cache, refreshed in bg.
    e.respondWith(
      caches.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    );
  }
});
