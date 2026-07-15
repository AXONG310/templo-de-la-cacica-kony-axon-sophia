const CACHE_NAME = 'axon-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalación e inyección de caché estático
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercepción de peticiones con exclusión estricta de APIs dinámicas
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // CONTROL CRÍTICO: Si la petición va dirigida a las funciones serverless o APIs, NO usar caché
  if (url.pathname.includes('/api/') || url.pathname.includes('/.netlify/')) {
    return fetch(e.request); 
  }

  // Estrategia Cache-First para recursos estáticos del ecosistema
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});