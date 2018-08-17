import idb from 'idb';
// let idb = require('idb');

const staticCacheName = 'restaurant-static-116'; 

const dbPromise = idb.open('udacity-restaurant-db', 1, upgradeDB => {
  // var keyValStore = upgradeDB.createObjectStore('keyval');
  // keyValStore.put('world', 'hello');
  // keyValStore.put('world2', 'hello1');
  switch (upgradeDB.oldVersion) {
  case 0:
    upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
  }
});

// read "hello" in "keyval"
// dbPromise.then(function(db) {
//   var tx = db.transaction('keyval');
//   var keyValStore = tx.objectStore('keyval');
//   return keyValStore.get('hello');
// }).then(function(val) {
//   console.log('The value of "hello" is:', val);
// });


// list of assets to cache on install
// cache each restaurant detail page as well
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll([
          '/index.html',
          '/css/styles.css',
          '/js/index.min.js',
          '/js/restaurant.min.js',
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
          '/img/fixed/offline_img1.png'
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
    // Add cache.put to cache images on each fetch
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(staticCacheName).then(cache => {
          // filter out browser-sync resources otherwise it will err
          if (!fetchResponse.url.includes('browser-sync')) { // prevent err
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(error => {
      if (event.request.url.includes('.jpg')) {
        return caches.match('/img/fixed/offline_img1.png');
      }
      // return new Response('Not connected to the internet', {
      return new Response(error, {
        status: 404,
        statusText: 'Not connected to the internet'
      });
    })
   
     
    // caches.open(staticCacheName).then(function(cache) {
    //   return cache.match(event.request).then(function(response) {
    //     return (
    //       response || fetch(event.request).then(function(networkResponse) {
    //         cache.add(event.request, networkResponse.clone());
    //         return networkResponse;
    //       })
    //     );
    //   });
    // }).catch(error => {
    //   console.log(error);
    //   if (event.request.url.includes('.jpg')) {
    //     return caches.match('/img/fixed/offline_img1.png');
    //   }
    //   return new Response(error, {
    //     status: 404,
    //     statusText: 'Not connected to the internet'
    //   });
    // })
     
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
