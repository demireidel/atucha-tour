// Service Worker for caching 3D assets
const CACHE_NAME = "atucha-3d-assets-v1"
const CACHE_URLS = [
  // 3D assets
  /.*\.ktx2$/,
  /.*\.glb$/,
  /.*\.gltf$/,
  /.*\.hdr$/,
  /.*\.exr$/,
  // WASM files
  /\/wasm\/.*/,
  // Textures
  /.*\.jpg$/,
  /.*\.png$/,
  /.*\.webp$/,
]

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url)

  // Check if this is a 3D asset we should cache
  const shouldCache = CACHE_URLS.some((pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.test(url.pathname)
    }
    return url.pathname.includes(pattern)
  })

  if (shouldCache) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            console.log("[SW] Cache hit:", url.pathname)
            return response
          }

          console.log("[SW] Cache miss, fetching:", url.pathname)
          return fetch(event.request).then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.ok) {
              cache.put(event.request, fetchResponse.clone())
            }
            return fetchResponse
          })
        })
      }),
    )
  }
})

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)),
      )
    }),
  )
})
