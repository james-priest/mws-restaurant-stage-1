const staticCacheName = 'restaurant-static-019';

// list of assets to cache on install
// cache each restaurant detail page as well
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll([
          '/index.html',
          // '/restaurant.html',
          '/css/styles.css',
          '/js/dbhelper.js',
          '/js/register_sw.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/data/restaurants.json',
          '/restaurant.html?id=1',
          '/restaurant.html?id=2',
          '/restaurant.html?id=3',
          '/restaurant.html?id=4',
          '/restaurant.html?id=5',
          '/restaurant.html?id=6',
          '/restaurant.html?id=7',
          '/restaurant.html?id=8',
          '/restaurant.html?id=9',
          '/restaurant.html?id=10',
          '/img/offline_img1.png'
        ]).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});

// intercept all requests
// either return cached asset or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    // new Response('Hello world', {
    //   headers: {
    //     'content-type': 'text/html'
    //   }
    // })
    // fetch('/img/1-300a.jpg').catch(error => {
    //   console.log('it failed. error:', error);
    // }
    // fetch(event.request).then(response => {
    //   if (response.status === 404) {
    //     return new Response('Whoops, not found');
    //   }
    //   return response;
    // }).catch(error => {
    //   return new Response('Uh-oh, that totally failed:', error);
    // })
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(error => {
      if (event.request.url.includes('.jpg')) {
        return caches.match('/img/offline_img1.png');
      }
      // console.log(error, 'no cache entry for:', event.request.url);
      return new Response('Not connected to the internet', {
        status: 404,
        statusText: "Not connected to the internet"
      });
    })
  );
});

// delete old/unused static caches
self.addEventListener('activate', event => {
  event.waitUntil(
    // caches.delete('-restaurant-static-001')
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('restaurant-static-') && cacheName !== staticCacheName;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});