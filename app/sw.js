const staticCacheName = 'restaurant-static-302'; 

// list of assets to cache on install
// cache each restaurant detail page as well
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        CL.log('my class');
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css',
          '/js/index.min.js',
          '/js/restaurant.min.js',
          '/restaurant.html?id=5bcab3cff27689550002e831',
          '/restaurant.html?id=5bcab495f27689550002e83c',
          '/restaurant.html?id=5bcab503f27689550002e842',
          '/restaurant.html?id=5bcb450df27689550002f416',
          '/restaurant.html?id=5bcb4733f27689550002f431',
          '/restaurant.html?id=5bcb4874f27689550002f451',
          '/restaurant.html?id=5bcb4947f27689550002f464',
          '/restaurant.html?id=5bcb5ca5f27689550002f719',
          '/restaurant.html?id=5bcb603bf27689550002f74d',
          '/restaurant.html?id=5bcb60f4f27689550002f75e',
          '/img/fixed/offline_img1.png',
          '/img/fixed/icon.png'
        ]).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});

let i = 0;
// intercept all requests
// return cached asset, idb data, or fetch from network
self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  
  // 1. filter Ajax Requests
  if (requestUrl.host.includes('restaurantdb-ae6c.restdb.io')) {
    console.log('intercept db fetch', ++i);
    // 2. Only cache GET methods
    if (event.request.method !== 'GET') {
      console.log('filtering out non-GET method');
      // return fetch(event.request)
      //   .then(response => response.json())
      //   .then(json => json);
      return;
    }

    // console.log('fetch intercept', ++i, requestUrl.href);
    
    if (request.url.includes('reviews')) {
      const qObj = JSON.parse(requestUrl.searchParams.get('q'));
      const id = qObj._parent_id;
      event.respondWith(idbReviewResponse(request, id));
    } else {
      event.respondWith(idbRestaurantResponse(request));
    }
  }
  else {
    event.respondWith(cacheResponse(request));
    
    // event.respondWith(fetch(event.request)
    //   .then(response => response));
  }
});

let j = 0;
function idbRestaurantResponse(request, id) {
  // 1. getAll records from objectStore
  // 2. if more than 1 rec then return match
  // 3. if no match then fetch json, write to idb, & return response

  return idbKeyVal.getAll('restaurants')
    .then(restaurants => {
      if (restaurants.length) {
        return restaurants;
      }
      return fetch(request)
        .then(response => response.json())
        .then(json => {
          json.forEach(restaurant => {
            console.log('fetch idb write', ++j, restaurant.id, restaurant.name);
            idbKeyVal.set('restaurants', restaurant);
          });
          return json;
        });
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}

let k = 0;
function idbReviewResponse(request, id) {
  return idbKeyVal.getAllIdx('reviews', 'restaurant_id', id)
    .then(reviews => {
      if (reviews.length) {
        // reviews.forEach(review => {
        //   console.log(review, review.key);
        // });
        return reviews;
      }
      return fetch(request)
        .then(response => response.json())
        .then(json => {
          json.forEach(review => {
            console.log('fetch idb review write', ++k, review.id, review.name);
            idbKeyVal.set('reviews', review);
          });
          return json;
        });
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}

function cacheResponse(request) {
  // match request...
  // return caches.match(request).then(response => {
  return caches.match(request, {
    // https://developers.google.com/web/updates/2015/09/updates-to-cache-api
    //ignoreSearch: true  // ignores url search string when serving from cache
    // this works great for my caching but breaks GoogleMaps
  }).then(response => {
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

// for testing purposes with gulp & browserify
class CL {
  static log(msg) {
    console.log(msg);
  }
}