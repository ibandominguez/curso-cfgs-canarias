const CACHE_NAME = "mi-pwa-cache-v1";
const REPO_NAME = "/curso-fcgs-canarias";

// Lista de recursos a cachear (App Shell y CDN's)
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",

  // Subjects
  "/subjects/filosofia.json",
  "/subjects/empresa.json",
  "/subjects/lengua.json",

  // Micro apps
  "/apps/estadistica.html",
  "/apps/silaba-tonica.html",

  // CDNS
  "https://cdn.tailwindcss.com?plugins=typography",
  "https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js",
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
].map((url) => (url.startsWith("http") ? url : REPO_NAME + url));

// 1. Evento de Instalación (Instalar el SW y cachear los recursos estáticos)
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando y cacheando recursos");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache abierto, agregando URLs:");
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Error al cachear una URL:", error);
      });
    }),
  );
});

// 2. Evento de Activación (Limpiar cachés viejos)
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activado");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Elimina cachés viejos
          }
        }),
      );
    }),
  );
});

// 3. Evento de Fetch (Manejo de solicitudes de red)
self.addEventListener("fetch", (event) => {
  // Estrategia Cache-First, luego Network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Si el recurso está en caché (incluyendo Tailwind/Alpine de CDN), lo devuelve
      if (response) {
        return response;
      }

      // 2. Si no está en caché, va a la red
      return fetch(event.request).catch(() => {
        // 3. Si la red falla Y el recurso *no* se encontró en caché,
        // simplemente dejamos que el fetch falle y el navegador muestre su error de desconexión.
        // (La lógica de devolver /offline.html ha sido eliminada)
        // El bloque .catch() aquí simplemente intercepta el error de red
        // y lo propaga, lo que resulta en un mensaje de "Sin conexión" del navegador.
        // No es necesario añadir código aquí, simplemente retorna.
      });
    }),
  );
});
