// Minimal service worker to avoid 404s and enable future enhancements

self.addEventListener('install', (event) => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    // Become available to all pages immediately
    self.clients.claim()
})

// Pass-through fetch handler (no caching by default)
self.addEventListener('fetch', () => {
    // Intentionally empty to act as a no-op SW
})



