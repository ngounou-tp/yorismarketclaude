/* Yorix CM — Service worker : shell cache + push + navigation fallback */
const CACHE = "yorix-sw-v3";
const OFFLINE = "/offline.html";
const PRECACHE = ["/", OFFLINE, "/favicon.svg", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;

  /* Navigation document : réseau puis cache offline */
  if (req.mode === "navigate" || req.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match(OFFLINE) || caches.match("/")),
        ),
    );
    return;
  }

  /* Assets : stale-while-revalidate léger */
  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || net;
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "yorix-outbox") {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener("push", (event) => {
  let payload = { title: "Yorix", body: "Nouvelle alerte sur votre marketplace.", url: "/", tag: "yorix" };
  try {
    if (event.data) {
      if (typeof event.data.json === "function") {
        Object.assign(payload, event.data.json());
      } else if (typeof event.data.text === "function") {
        const txt = event.data.text();
        if (txt) Object.assign(payload, JSON.parse(txt));
      }
    }
  } catch {
    /* garder défaut */
  }

  const title = payload.title || "Yorix CM";
  const body = payload.body || "Ouvrir pour voir votre activité.";
  const url = payload.url || "/";
  const tag = payload.tag || "yorix-generic";
  const crit = payload.priority === "critical" || payload.priority === "urgent";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: String(body).slice(0, 240),
      icon: payload.icon || "/favicon.svg",
      badge: payload.badge || "/favicon.svg",
      tag,
      vibrate: [100, 50, 100],
      renotify: true,
      requireInteraction: crit,
      data: { url, tag },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        try {
          client.postMessage({ type: "NOTIF_NAV", url });
          return client.focus();
        } catch {
          /* continue */
        }
      }
      if (self.clients.openWindow) {
        const abs = url.startsWith("http") ? url : `${self.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
        return self.clients.openWindow(abs);
      }
    }),
  );
});
