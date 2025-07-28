
const CACHE_NAME = 'ev-calculator-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/components/Header.tsx',
  '/components/CalculatorForm.tsx',
  '/components/ResultsDisplay.tsx',
  '/components/VehicleInfoPanel.tsx',
  '/components/IconComponents.tsx',
  '/components/AdvicePanel.tsx',
  '/vite.svg',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/@google/genai'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache. Caching app shell.');
        // Use addAll with a catch block to prevent the entire service worker from failing if one resource fails to cache.
        return cache.addAll(URLS_TO_CACHE).catch(err => {
            console.error('Failed to cache one or more resources during install:', err);
        });
      })
      .catch(err => {
          console.error('Failed to open cache:', err);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // We don't cache opaque responses (e.g. from no-cors requests for CDNs) 
            // or errors, as they can pollute the cache.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            
            // Do not cache opaque responses from cross-origin requests unless necessary
            if (networkResponse.type === 'opaque') {
                // For CDNs like esm.sh, we might want to cache them.
                // Be aware of the storage implications.
                if(!event.request.url.startsWith('https://esm.sh')) {
                    return networkResponse;
                }
            }


            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.log('Fetch failed; returning offline page instead.', error);
            // Optionally, return a fallback page for failed fetches
            // return caches.match('/offline.html');
        });
      })
  );
});