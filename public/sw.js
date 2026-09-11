/* Service worker de Dulce Espera.
   Objetivo: que la cocina pueda abrir la aplicacion aunque se caiga la red.
   Regla principal: solo se cachean recursos de este origen. Las llamadas a la
   API viajan siempre por red; los pedidos sin conexion los conserva la propia
   aplicacion en su cola local. */

const VERSION = 'v3';
const CACHE_APP = `dulce-espera-app-${VERSION}`;
const CACHE_PAGINAS = `dulce-espera-paginas-${VERSION}`;
const CACHE_RECURSOS = `dulce-espera-recursos-${VERSION}`;

const VIGENTES = [CACHE_APP, CACHE_PAGINAS, CACHE_RECURSOS];

const MAXIMO_PAGINAS = 20;
const MAXIMO_RECURSOS = 150;

/* Puntos de entrada habituales, para que la app abra sin red desde cero. */
const PRECARGA = ['/', '/panel', '/acceso', '/logo.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_APP)
      .then((cache) => Promise.allSettled(PRECARGA.map((ruta) => cache.add(ruta))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((nombre) => !VIGENTES.includes(nombre)).map((nombre) => caches.delete(nombre))),
      )
      .then(() => self.clients.claim()),
  );
});

/** Poda las entradas mas antiguas para que el cache no crezca sin limite. */
async function limitar(nombreCache, maximo) {
  const cache = await caches.open(nombreCache);
  const claves = await cache.keys();
  if (claves.length <= maximo) return;
  await Promise.all(claves.slice(0, claves.length - maximo).map((clave) => cache.delete(clave)));
}

async function guardar(nombreCache, peticion, respuesta, maximo) {
  if (!respuesta.ok || respuesta.redirected || respuesta.type === 'opaque') return;
  const cache = await caches.open(nombreCache);
  await cache.put(peticion, respuesta.clone());
  await limitar(nombreCache, maximo);
}

/**
 * Paginas: red primero para ver datos frescos, cache como respaldo.
 *
 * Solo se responde con la copia de la MISMA direccion. Servir el HTML de otra
 * ruta romperia la hidratacion de Next, asi que si esa pagina nunca se visito
 * se deja que el navegador muestre su propio aviso de sin conexion.
 */
async function estrategiaPagina(peticion) {
  try {
    const respuesta = await fetch(peticion);
    await guardar(CACHE_PAGINAS, peticion, respuesta, MAXIMO_PAGINAS);
    return respuesta;
  } catch (error) {
    const enCache = await caches.match(peticion, { ignoreSearch: true });
    if (enCache) return enCache;
    throw error;
  }
}

/** Recursos con nombre versionado: cache primero. */
async function estrategiaRecurso(peticion) {
  const enCache = await caches.match(peticion);
  if (enCache) return enCache;

  const respuesta = await fetch(peticion);
  await guardar(CACHE_RECURSOS, peticion, respuesta, MAXIMO_RECURSOS);
  return respuesta;
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API, WhatsApp y cualquier otro origen: siempre red directa.
  if (url.origin !== self.location.origin) return;

  // Recursos internos de desarrollo y navegacion por streaming de Next.
  if (url.pathname.startsWith('/_next/webpack') || url.searchParams.has('_rsc')) return;

  if (request.mode === 'navigate') {
    evento.respondWith(estrategiaPagina(request));
    return;
  }

  if (url.pathname.startsWith('/_next/static/') || /\.(?:css|js|woff2?|png|jpg|jpeg|svg|ico|webp)$/.test(url.pathname)) {
    evento.respondWith(estrategiaRecurso(request));
  }
});
