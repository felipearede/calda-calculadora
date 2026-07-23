// GERADO por build-app.mjs. Nao edite a mao.
// Versao: 9fbf8188f56d
// HTML: network-first (atualiza sozinho quando online, cai no cache se offline).
// Estaticos: cache-first (icones e manifest nao mudam).
const CACHE = 'calda-9fbf8188f56d';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function ehPagina(req) {
  return req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // A pagina em si vai na rede primeiro, para o usuario receber atualizacao.
  if (ehPagina(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copia)).catch(() => {});
          return resp;
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // Resto (icones, manifest): cache primeiro, que nao muda e economiza rede.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((resp) => {
      const copia = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
      return resp;
    }))
  );
});
