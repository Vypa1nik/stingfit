const CACHE_VERSION = 'stingfit-v1'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(event.request.url)
  const isNavigation = event.request.mode === 'navigate'
  const isSameOrigin = requestUrl.origin === self.location.origin

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_VERSION).then((cache) => cache.put('/index.html', clone))
          return response
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_VERSION)
          return cache.match('/index.html') || cache.match('/')
        }),
    )
    return
  }

  if (!isSameOrigin) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).then((response) => {
        if (!response.ok) {
          return response
        }

        const clone = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone))
        return response
      })
    }),
  )
})
