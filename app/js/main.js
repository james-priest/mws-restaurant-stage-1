let restaurants,  // eslint-disable-line no-unused-vars 
  neighborhoods,  // eslint-disable-line no-unused-vars 
  cuisines; // eslint-disable-line no-unused-vars 
var map;  // eslint-disable-line no-unused-vars 
var markers = []; // eslint-disable-line no-unused-vars 

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
// document.addEventListener('DOMContentLoaded', (event) => {
document.addEventListener('DOMContentLoaded', () => {
  fetchNeighborhoods();
  fetchCuisines();
});


window.addEventListener('load', function () {
  DBHelper.processQueue();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  // map.controls.prototype.alt = 'img';
  updateRestaurants();
  // this helps accessibility test pass
  google.maps.event.addListenerOnce(self.map, 'idle', () => {
    document.getElementsByTagName('iframe')[0].title = 'Google Maps';
  });
  // add alt tags to maps images
  // // google.maps.event.addListener(self.map, 'domready', function() { // none
  // // google.maps.event.addListener(self.map, 'idle', function() { // only 1
  // google.maps.event.addListener(self.map, 'tilesloaded', function () { // 26 should be 48
  //   // there is no map event that fires after controls loaded. only way is to poll
  //   var images = window.parent.document.querySelectorAll('#map img');
  //   // console.log(images.length);
  //   var count = 0;
  //   images.forEach(function (image) {
  //     if (image.src === 'https://maps.gstatic.com/mapfiles/api-3/images/google4.png') {
  //       console.log('Got Google!');
  //     }
  //     if (!image.alt) {
  //       console.log(image.nodeName, image.src, image.alt);
  //       image.alt = '';
  //       count += 1;
  //       console.log(count);
  //     }
  //   });
  // });
};

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const fav = document.createElement('button');
  fav.className = 'fav-control';
  fav.setAttribute('aria-label', 'favorite');
  
  // RegEx method tests if is_favorite is true or "true" and returns true
  // https://codippa.com/how-to-convert-string-to-boolean-javascript/
  if ((/true/i).test(restaurant.is_favorite)) {
    fav.classList.add('active');
    fav.setAttribute('aria-pressed', 'true');
    fav.innerHTML = `Remove ${restaurant.name} as a favorite`;
    fav.title = `Remove ${restaurant.name} as a favorite`;
  } else {
    fav.setAttribute('aria-pressed', 'false');
    fav.innerHTML = `Add ${restaurant.name} as a favorite`;
    fav.title = `Add ${restaurant.name} as a favorite`;
  }

  fav.addEventListener('click', (evt) => {
    favoriteClickHandler(evt, fav, restaurant);
  }, false);

  li.append(fav);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForIndex(restaurant);
  image.sizes = '300px';
  const altText = restaurant.name + ' restaurant in ' + restaurant.neighborhood;
  image.title = altText;
  image.alt = altText;
  li.append(image);

  const div = document.createElement('div');
  div.className = 'restaurant-info';

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  div.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  li.append(div);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.addEventListener('click', () => { window.location.href = DBHelper.urlForRestaurant(restaurant); });
  li.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};
