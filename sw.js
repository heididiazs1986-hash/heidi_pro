const CACHE = 'heidi-life-os-v2';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.json','./gatito.png','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const rc=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html', rc)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => { const rc=r.clone(); caches.open(CACHE).then(c=>c.put(e.request, rc)); return r; })));
});
