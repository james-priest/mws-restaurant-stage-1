import idb from 'idb';
// let idb = require('idb');

const staticCacheName = 'restaurant-static-136'; 

const dbPromise = idb.open('udacity-restaurant-db', 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants');
  }
});

// IndexedDB object with get & set methods 
// https://github.com/jakearchibald/idb
const idbKeyVal = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction('restaurants')
        .objectStore('restaurants')
        .get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction('restaurants', 'readwrite');
      tx.objectStore('restaurants').put(val, key);
      return tx.complete;
    });
  }
};

/* 
const dbPromise = idb.open('udacity-restaurant-db', 1, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      // var keyValStore = upgradeDB.createObjectStore('restaurants', {
      //   keyPath: 'id'
      // });
      // keyValStore.createIndex('id', 'id');
      upgradeDB.createObjectStore('restaurants');
    case 1:
      upgradeDB.createObjectStore('people', {
        keyPath: 'name'
      });
    case 2:
      var peopleStore = upgradeDB.transaction.objectStore('people');
      peopleStore.createIndex('animal', 'favoriteAnimal');
    case 3:
      // var peopleStore = upgradeDB.transaction.objectStore('people');
      peopleStore.createIndex('age', 'age');
  } 
});

dbPromise.then(db => {
  const tx = db.transaction('people', 'readwrite');
  const peopleStore = tx.objectStore('people');

  peopleStore.put({
    name: 'James Priest',
    age: 48,
    favoriteAnimal: 'dog'
  });
  peopleStore.put({
    name: 'Pacifist Dove',
    age: 20,
    favoriteAnimal: 'cat'
  });
  peopleStore.put({
    name: 'Onika Maraj',
    age: 35,
    favoriteAnimal: 'lioness'
  });

  return tx.complete;
});

dbPromise.then(db => {
  const tx = db.transaction('people');
  const peopleStore = tx.objectStore('people');
  const animalIndex = peopleStore.index('animal');
  const ageIndex = peopleStore.index('age');

  // return peopleStore.getAll();
  return ageIndex.getAll();
}).then(people => {
  console.log('Ordered by Age:', people);
});
*/

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
// return cached asset, idb asset, or fetch from network
self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // 1. filter Ajax Requests
  if (requestUrl.port === '1337') {
    event.respondWith(idbResponse(request));
  }
  else {
    event.respondWith(cacheResponse(request));
  }
});

function idbResponse(request) {
  // 2. check idb & return match
  // 3. if no match then clone, save, & return response

  return idbKeyVal.get('restaurants')
    .then(restaurants => {
      return (
        restaurants ||
        fetch(request)
          .then(response => response.json())
          .then(json => {
            idbKeyVal.set('restaurants', json);
            return json;
          })
      );
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
  
  // return idbKeyVal.get('restaurants').then(restaurants => {
  //   return restaurants || fetch(request)
  //     .then(response => response.json())
  //     .then(json => {
  //       return idbKeyVal.set('restaurants', json)
  //         .then(json => json);
  //     })
  //     .then(response => new Response(JSON.stringify(response)))
  //     .catch(error => {
  //       return new Response(error, {
  //         status: 404,
  //         statusText: 'my bad request'
  //       });
  //     });
  // });

  // return dbPromise.then(db => {
  //   var tx = db.transaction('restaurants');
  //   var store = tx.objectStore('restaurants');

  //   return store.get(id);
  // }).then(data => {
  //   console.log(data);
  //   return data;
  // }).then(data => {
  //   return data || fetch(request).then(fetchResponse => {
  //     if (!fetchResponse.ok) {
  //       throw Error(`Ajax Request failed. Returned status of ${fetchResponse.statusText}`);
  //     }
  //     return fetchResponse.json();
  //   }).then(json => {

  //     // add into idb
  //     return dbPromise.then(db => {
  //       var tx = db.transaction('restaurants', 'readwrite');
  //       var store = tx.objectStore('restaurants');

  //       store.put(json);
  //       return json;
  //     });
  //   });
  // });
}

function cacheResponse(request) {
  // match request...
  return caches.match(request).then(response => {
    // return matched response OR if no match then
    // fetch, open cache, cache.put response.clone, return response
    return response || fetch(request).then(fetchResponse => {
      return caches.open(staticCacheName).then(cache => {
        // filter out browser-sync resources otherwise it will err
        if (!fetchResponse.url.includes('browser-sync')) { // prevent err
          cache.put(request, fetchResponse.clone()); // put clone in cache
        }
        return fetchResponse; // send original back to browser
      });
    });
  }).catch(error => {
    if (request.url.includes('.jpg')) {
      return caches.match('/img/fixed/offline_img1.png');
    }
    // return new Response('Not connected to the internet', {
    return new Response(error, {
      status: 404,
      statusText: 'Not connected to the internet'
    });
  });
  
  // return caches.open(staticCacheName).then(function (cache) {
  //   return cache.match(request).then(function (response) {
  //     return (
  //       response || fetch(request).then(function (networkResponse) {
  //         cache.add(request, networkResponse.clone());
  //         return networkResponse;
  //       })
  //     );
  //   });
  // }).catch(error => {
  //   console.log(error);
  //   if (request.url.includes('.jpg')) {
  //     return caches.match('/img/fixed/offline_img1.png');
  //   }
  //   return new Response(error, {
  //     status: 404,
  //     statusText: 'Not connected to the internet'
  //   });
  // });
}

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
