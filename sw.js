// Service worker mínimo: hace que el navegador ofrezca "Instalar" y guarda la portada para abrir rápido.
const C = 'gys-hh-v4', BASE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png?v=2', 'icon-512.png?v=2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // la app de Google va directo, sin caché
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request)));
});

// Avisos: los muestra la página (index.html); aquí solo se abre la app al tocarlos.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const vista = (e.notification.data || {}).vista || '';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) { if (c.url.startsWith(self.registration.scope)) { if (vista) c.postMessage({ gys: 'ir', vista }); return c.focus(); } }
    return clients.openWindow('./' + (vista ? '#' + vista : ''));
  }));
});
