/* Service worker do link da bio.
 *
 * - Página (HTML): rede primeiro; sem internet, entrega a última versão salva.
 * - /assets/* (JS, CSS, fontes com hash no nome): cache primeiro — nunca mudam.
 * - Imagens e demais arquivos: entrega o salvo na hora e atualiza por trás.
 *
 * Não há lista fixa de arquivos: cada deploy novo chega pela rede na
 * próxima visita, então nada fica preso numa versão velha.
 */
const CACHE = "nf-v1";
const MAX_ENTRIES = 90;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function trim(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_ENTRIES) return;
  await Promise.all(keys.slice(0, keys.length - MAX_ENTRIES).map((k) => cache.delete(k)));
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch {
    return (await cache.match("/")) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) {
    cache.put(request, res.clone());
    trim(cache);
  }
  return res;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const update = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone()).then(() => trim(cache));
      return res;
    })
    .catch(() => hit);
  if (hit) {
    event.waitUntil(update);
    return hit;
  }
  return update;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(request));
  } else if (/\.(webp|png|jpe?g|svg|vcf|webmanifest)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
