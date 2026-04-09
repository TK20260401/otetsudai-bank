const CACHE_NAME = "okozukai-quest-v2";
const PRECACHE_URLS = ["/", "/login", "/help", "/manifest.json"];

// API・認証リクエストはキャッシュしない
const NO_CACHE_PATTERNS = [
  /\/api\//,
  /supabase/,
  /\.supabase\./,
  /auth/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // API・外部リクエストはキャッシュしない
  if (NO_CACHE_PATTERNS.some((p) => p.test(url.href))) return;

  // 静的アセット: Cache First
  if (
    url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // HTMLページ: Network First → キャッシュフォールバック
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(
          (cached) =>
            cached ||
            caches.match("/").then(
              (fallback) =>
                fallback ||
                new Response("オフラインです。インターネットに接続してください。", {
                  status: 503,
                  headers: { "Content-Type": "text/plain; charset=utf-8" },
                })
            )
        )
      )
  );
});
