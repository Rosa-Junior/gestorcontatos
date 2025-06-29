
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('contatos-cache').then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/inicio.html',
        '/insercao.html',
        '/lista.html',
        '/detalhes.html',
        '/manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
