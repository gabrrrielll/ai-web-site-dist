"use strict";

var CACHE_NAME = 'ai-website-editor-v1'; // This list should be expanded with actual bundled assets in a real build process.

var urlsToCache = ['/', '/index.html', '/site-config.json'];
self.addEventListener('install', function (event) {
  self.skipWaiting(); // Activate worker immediately

  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
    console.log('Opened cache');
    return cache.addAll(urlsToCache);
  })["catch"](function (error) {
    console.error('Cache installation failed:', error);
  }));
});
self.addEventListener('fetch', function (event) {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(event.request).then(function (response) {
      // Return the cached response if it exists.
      if (response) {
        return response;
      } // If the request is not in the cache, fetch it from the network.


      return fetch(event.request).then(function (networkResponse) {
        // Don't cache third-party API requests (e.g., Gemini, Unsplash, Tailwind CDN)
        if (!event.request.url.startsWith(self.location.origin)) {
          return networkResponse;
        } // Also, don't cache responses that are not OK.


        if (networkResponse && networkResponse.status === 200) {
          // Clone the response because it's a one-time-use stream.
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      })["catch"](function (error) {
        console.error('Fetch failed:', error); // Return a fallback response or rethrow

        throw error;
      });
    });
  })["catch"](function (error) {
    console.error('Cache operation failed:', error); // Fallback to network request

    return fetch(event.request);
  }));
}); // Clean up old caches on activation

self.addEventListener('activate', function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.map(function (cacheName) {
      if (cacheWhitelist.indexOf(cacheName) === -1) {
        console.log('Deleting old cache:', cacheName);
        return caches["delete"](cacheName);
      }
    }));
  })["catch"](function (error) {
    console.error('Cache cleanup failed:', error);
  }));
}); // Handle message events properly

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
//# sourceMappingURL=sw.dev.js.map
