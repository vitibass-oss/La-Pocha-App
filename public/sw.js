const CACHE_NAME = 'pocha-offline-v6';
const STATIC_SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Verify if HTML response is a legitimate application shell rather than a proxy/reboot splash
function isLegitimateAppShell(text) {
  if (!text || typeof text !== 'string') return false;
  const isInterimScreen =
    text.includes('Please wait while your application starts') ||
    text.includes('Starting container') ||
    text.includes('Dev server starting');
  return !isInterimScreen && text.includes('root');
}

// Install Event: Pre-cache primary shell assets safely
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_SHELL_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`SW pre-cache bypassed for ${asset}:`, err);
        }
      }
    }).catch((err) => console.warn('SW install cache failed:', err))
  );
});

// Activate Event: Evict obsolete caches and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Control message channel
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_ALL_CACHES') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Fetch Event: Cache-First for static assets, Fast-Network with Cache-Fallback for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation Requests (HTML Documents)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Fast timeout race for network: 1200ms
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );

        const networkPromise = fetch(event.request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const text = await networkResponse.clone().text();
              if (isLegitimateAppShell(text)) {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(event.request, networkResponse.clone());
                await cache.put('./index.html', networkResponse.clone());
                return networkResponse;
              }
            }
            return null;
          })
          .catch(() => null);

        const fastestResult = await Promise.race([networkPromise, timeoutPromise]);
        if (fastestResult) return fastestResult;

        // Fallback directly to cached shell
        const cachedDoc =
          (await caches.match(event.request)) ||
          (await caches.match('./index.html')) ||
          (await caches.match('./')) ||
          (await caches.match('/index.html')) ||
          (await caches.match('/'));

        if (cachedDoc) return cachedDoc;

        // In case network took slightly longer than 1200ms
        const lateNetworkResult = await networkPromise;
        if (lateNetworkResult) return lateNetworkResult;

        // Ultimate offline recovery shell
        return new Response(
          `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>La Pocha</title><style>body{background:#020617;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px}button{background:#f59e0b;color:#020617;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;cursor:pointer;margin-top:16px}</style></head><body><div><div style="font-size:40px;margin-bottom:12px">🎴</div><h2>Anotador de La Pocha</h2><p style="color:#94a3b8;font-size:14px">Iniciando aplicación offline...</p><button onclick="location.reload()">Reintentar</button></div></body></html>`,
          { headers: { 'Content-Type': 'text/html' } }
        );
      })()
    );
    return;
  }

  // 2. Static Resources (JS bundles, CSS, Images, SVGs, Fonts)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Opportunistic background update
        fetch(event.request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
            }
          })
          .catch(() => {});
        return cached;
      }

      return fetch(event.request)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkRes;
        })
        .catch(() => {
          return new Response('', { status: 408, statusText: 'Offline Asset Unavailable' });
        });
    })
  );
});
