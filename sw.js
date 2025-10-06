const CACHE_NAME = "cfgs-cache-v1";
const REPO_NAME = "/curso-cfgs-canarias";
const OFFLINE_URL = REPO_NAME + "/offline.html";

// Lista de recursos a cachear (App Shell y CDNs)
const urlsToCache = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",

  // Subjects
  "/subjects/filosofia.json",
  "/subjects/empresa.json",
  "/subjects/lengua.json",
  "/subjects/matematicas.json",

  // Micro apps
  "/apps/estadistica.html",
  "/apps/tipo-tonica-desktop.html",
  "/apps/silaba-tonica.html",
  "/apps/graficos-cualitativos.html",

  // CDNs
  "https://cdn.tailwindcss.com?plugins=typography",
  "https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js",
  "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
  "https://www.gstatic.com/charts/loader.js",
].map((url) => (url.startsWith("http") ? url : REPO_NAME + url));

// --------------------------
// 1. Instalación del SW
// --------------------------
self.addEventListener("install", (event) => {
  console.log("Service Worker: Instalando y cacheando recursos...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache abierto, agregando URLs...");
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.error("Error al cachear recursos:", err);
      }),
  );
  self.skipWaiting();
});

// --------------------------
// 2. Activación del SW
// --------------------------
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activado");
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log("Eliminando cache viejo:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// --------------------------
// 3. Manejo de Fetch
// --------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Opcional: actualizar cache con respuestas válidas
        if (event.request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => {
          // Devuelve cachedResponse o la página offline
          return cachedResponse || caches.match(OFFLINE_URL);
        }),
      ),
  );
});
