let restaurant; // eslint-disable-line no-unused-vars 
var map;  // eslint-disable-line no-unused-vars
var focusedElementBeforeModal;
const modalOverlay = document.querySelector('.modal-overlay');

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
};

window.addEventListener('load', function () {
  DBHelper.processQueue();
});

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const favorite = document.getElementById('restaurant-fav');
  // RegEx method tests if is_favorite is true or "true" and returns true
  // https://codippa.com/how-to-convert-string-to-boolean-javascript/
  if ((/true/i).test(restaurant.is_favorite)) {
    favorite.classList.add('active');
    favorite.setAttribute('aria-pressed', 'true');
    favorite.innerHTML = `Remove ${restaurant.name} as a favorite`;
    favorite.title = `Remove ${restaurant.name} as a favorite`;
  } else {
    favorite.setAttribute('aria-pressed', 'false');
    favorite.innerHTML = `Add ${restaurant.name} as a favorite`;
    favorite.title = `Add ${restaurant.name} as a favorite`;
  }
  
  favorite.addEventListener('click', (evt) => {
    favoriteClickHandler(evt, favorite, restaurant);
  }, false);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.sizes = '(max-width: 320px) 300px, (max-width: 425px) 400px, (max-width: 635px) 600px, (min-width: 636px) 400px';
  const altText = restaurant.name + ' restaurant in ' + restaurant.neighborhood;
  image.title = altText;
  image.alt = altText;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchRestaurantReviewsById(restaurant._id, fillReviewsHTML);
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;

  if (error) {
    console.log('Error retrieving reviews', error);
  }
  const header = document.getElementById('reviews-header');
  header.innerHTML = '';

  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  header.appendChild(title);
  
  const addReview = document.createElement('button');
  addReview.id = 'review-add-btn';
  addReview.classList.add('review_btn');
  addReview.innerHTML = '+';
  addReview.setAttribute('aria-label', 'add review');
  addReview.title = 'Add Review';
  addReview.addEventListener('click', openAddReviewModal);
  header.appendChild(addReview);
  
  const container = document.getElementById('reviews-container');
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.innerHTML = '';
  reviews.reverse();
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  const ctrlDiv = document.createElement('div');
  ctrlDiv.classList.add('ctrl-div');

  const editBtn = document.createElement('button');
  editBtn.id = 'review-edit-btn';
  editBtn.classList.add('review_btn');
  editBtn.dataset.reviewId = review._id;
  editBtn.innerHTML = 'Edit';
  editBtn.setAttribute('aria-label', 'edit review');
  editBtn.title = 'Edit Review';
  // editBtn.addEventListener('click', (e) => editReview(e, review));
  editBtn.addEventListener('click', (e) => openEditReviewModal(e, review));
  ctrlDiv.appendChild(editBtn);

  const rating = document.createElement('div');
  rating.classList.add('static-rate');
  const star1 = document.createElement('label');
  const star2 = document.createElement('label');
  const star3 = document.createElement('label');
  const star4 = document.createElement('label');
  const star5 = document.createElement('label');
  star1.textContent = 'star1';
  star2.textContent = 'star2';
  star3.textContent = 'star3';
  star4.textContent = 'star4';
  star5.textContent = 'star5';
  switch (true) {
    case (review.rating > 4):
      star5.classList.add('gold');
    case (review.rating > 3):
      star4.classList.add('gold');
    case (review.rating > 2):
      star3.classList.add('gold');
    case (review.rating > 1):
      star2.classList.add('gold');
    case (review.rating > 0):
      star1.classList.add('gold');
  }
  star1.classList.add('gold');
  star2.classList.add('gold');
  star3.classList.add('gold');
  rating.appendChild(star1);
  rating.appendChild(star2);
  rating.appendChild(star3);
  rating.appendChild(star4);
  rating.appendChild(star5);
  rating.dataset.rating = review.rating;
  ctrlDiv.appendChild(rating);

  const delBtn = document.createElement('button');
  delBtn.id = 'review-del-btn';
  delBtn.classList.add('review_btn');
  delBtn.dataset.reviewId = review._id;
  delBtn.dataset.restaurantId = review._parent_id;
  delBtn.dataset.reviewName = review.name;
  delBtn.innerHTML = 'x';
  delBtn.setAttribute('aria-label', 'delete review');
  delBtn.title = 'Delete Review';
  // delBtn.addEventListener('click', delReview);
  delBtn.addEventListener('click', openConfirmDeleteModal);
  ctrlDiv.appendChild(delBtn);

  li.appendChild(ctrlDiv);

  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const createdAt = document.createElement('p');
  createdAt.classList.add('createdAt');
  // const createdDate = new Date(review.createdAt).toLocaleDateString();
  const createdDate = review._created ?
    new Date(review._created).toLocaleDateString() :
    'Pending';
  createdAt.innerHTML = `<strong>${createdDate}</strong>`;
  li.appendChild(createdAt);

  if (review._changed > review._created) {
    
    const updatedAt = document.createElement('p');
    // const updatedDate = new Date(review.updatedAt).toLocaleDateString();
    const updatedDate = review._changed ?
      new Date(review._changed).toLocaleDateString() :
      'Pending';
    updatedAt.innerHTML = `Updated:<strong>${updatedDate}</strong>`;
    updatedAt.classList.add('updatedAt');
    li.appendChild(updatedAt);
  }

  // const rating = document.createElement('p');
  // rating.classList.add('rating');
  // rating.innerHTML = `Rating: ${review.rating}`;
  // rating.dataset.rating = review.rating;
  // li.appendChild(rating);

  const comments = document.createElement('p');
  comments.classList.add('comments');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  // name = name.replace(/[\[\]]/g, '\\$&');
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

// Adapted from modal dialog sample code in Udacity Web Accessibility course 891
//  https://github.com/udacity/ud891/blob/gh-pages/lesson2-focus/07-modals-and-keyboard-traps/solution/modal.js
const wireUpModal = (modal, closeModal) => {
  // Save current focus
  focusedElementBeforeModal = document.activeElement;

  // Listen for and trap the keyboard
  modal.addEventListener('keydown', trapTabKey);

  // Listen for indicators to close the modal
  modalOverlay.addEventListener('click', closeModal);
  // Close btn
  let closeBtns = document.querySelectorAll('.close-btn');
  // closeBtn.addEventListener('click', closeModal);
  closeBtns = Array.prototype.slice.call(closeBtns);
  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  // Find all focusable children
  var focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
  var focusableElements = modal.querySelectorAll(focusableElementsString);
  // Convert NodeList to Array
  focusableElements = Array.prototype.slice.call(focusableElements);

  var firstTabStop = focusableElements[0];
  var lastTabStop = focusableElements[focusableElements.length - 1];

  // Show the modal and overlay
  modal.classList.add('show');
  modalOverlay.classList.add('show');

  // Focus second child
  setTimeout(() => {
    firstTabStop.focus();
    focusableElements[1].focus();
  }, 200);

  function trapTabKey(e) {
    // Check for TAB key press
    if (e.keyCode === 9) {

      // SHIFT + TAB
      if (e.shiftKey) {
        if (document.activeElement === firstTabStop) {
          e.preventDefault();
          lastTabStop.focus();
        }

      // TAB
      } else {
        if (document.activeElement === lastTabStop) {
          e.preventDefault();
          firstTabStop.focus();
        }
      }
    }

    // ESCAPE
    if (e.keyCode === 27) {
      closeModal();
    }
  }
};

const openAddReviewModal = () => {
  const modal = document.getElementById('add_review_modal');
  wireUpModal(modal, closeAddReviewModal);

  document.getElementById('add-review-header').innerText = 'Add Review';

  // submit form
  const form = document.getElementById('review_form');
  form.addEventListener('submit', addReview, false);
};

const openConfirmDeleteModal = (e) => {
  const modal = document.getElementById('confirm_delete_modal');
  wireUpModal(modal, closeConfirmDeleteModal);

  const nameContainer = document.getElementById('review_name'); 
  nameContainer.textContent = e.target.dataset.reviewName;

  const cancelBtn = document.getElementById('cancel_btn');
  cancelBtn.onclick = closeConfirmDeleteModal;

  const delConfirmBtn = document.getElementById('delete_confirm_btn');
  delConfirmBtn.dataset.reviewId = e.target.dataset.reviewId;
  delConfirmBtn.dataset.restaurantId = e.target.dataset.restaurantId;

  delConfirmBtn.onclick = delReview;
};

const openEditReviewModal = (e, review) => {
  const modal = document.getElementById('add_review_modal');
  wireUpModal(modal, closeAddReviewModal);
  
  document.getElementById('add-review-header').innerText = 'Edit Review';
  
  document.querySelector('#reviewName').value = review.name;
  switch (review.rating) {
    case 1:
      document.getElementById('star1').checked = true;
      break;
    case 2:
      document.getElementById('star2').checked = true;
      break;
    case 3:
      document.getElementById('star3').checked = true;
      break;
    case 4:
      document.getElementById('star4').checked = true;
      break;
    case 5:
      document.getElementById('star5').checked = true;
      break;
  }
  document.querySelector('#reviewComments').value = review.comments;

  
  const review_id = e.target.dataset.reviewId;
  console.log(review_id);
  console.log(review);

  // submit form
  const form = document.getElementById('review_form');
  form.addEventListener('submit', editReview, false);
};

const editReview = (e, review) => {
  e.preventDefault();
  const form = e.target;

  if (form.checkValidity()) {
    const review_id = e.target.dataset.reviewId;
    console.log(review_id);
    console.log(review);
  }
};

const delReview = (e) => {
  const review_id = e.target.dataset.reviewId;
  const restaurant_id = e.target.dataset.restaurantId;
  const idb_id = e.target.dataset.idbId;
  console.log(review_id);

  if (review_id === "undefined") {
    DBHelper.delIDBReview(idb_id, restaurant_id);
    getIDBReviews(restaurant_id);
    return;
  }

  DBHelper.deleteRestaurantReview(review_id, restaurant_id, (error, result) => {
    console.log('got delete callback');
    if (error) {
      showOffline();
    } else {
      console.log(result);
      DBHelper.delIDBReview(review_id, restaurant_id);
    }
    // update idb
    // idbKeyVal.getAllIdx('reviews', 'restaurant_id', restaurant_id)
    //   .then(reviews => {
    //     // console.log(reviews);
    //     fillReviewsHTML(null, reviews);
    //     closeConfirmDeleteModal();
    //     document.getElementById('review-add-btn').focus();
    //   });
    getIDBReviews(restaurant_id);
  });
};

const getIDBReviews = function (restaurant_id) {
  idbKeyVal.getAllIdx('reviews', 'restaurant_id', restaurant_id)
    .then(reviews => {
      // console.log(reviews);
      fillReviewsHTML(null, reviews);
      closeConfirmDeleteModal();
      document.getElementById('review-add-btn').focus();
    });
};

const addReview = (e) => {
  e.preventDefault();
  const form = e.target;
 
  if (form.checkValidity()) {
    console.log('is valid');

    const restaurant_id = self.restaurant._id;
    const name = document.querySelector('#reviewName').value;
    const rating = document.querySelector('input[name=rate]:checked').value;
    const comments = document.querySelector('#reviewComments').value;
  
    // attempt save to database server
    DBHelper.createRestaurantReview(restaurant_id, name, rating, comments, (error, review) => {
      console.log('got add callback');
      form.reset();
      if (error) {
        console.log('We are offline. Review has been saved to the queue.');
        // window.location.href = `/restaurant.html?id=${self.restaurant.id}&isOffline=true`;
        showOffline();
      } else {
        console.log('Received updated record from DB Server', review);
        DBHelper.createIDBReview(review); // write record to local IDB store
        // window.location.href = `/restaurant.html?id=${self.restaurant.id}`;
      }
      idbKeyVal.getAllIdx('reviews', 'restaurant_id', restaurant_id)
        .then(reviews => {
          console.log('new review', reviews);
          fillReviewsHTML(null, reviews);
          closeAddReviewModal();
          document.getElementById('review-add-btn').focus();
        });
    });
  }
};

const closeConfirmDeleteModal = () => {
  const modal = document.getElementById('confirm_delete_modal');
  // Hide the modal and overlay
  modal.classList.remove('show');
  modalOverlay.classList.remove('show');

  // Set focus back to element that had it before the modal was opened
  focusedElementBeforeModal.focus();
};

const closeAddReviewModal = () => {
  const modal = document.getElementById('add_review_modal');
  // Hide the modal and overlay
  modal.classList.remove('show');
  modalOverlay.classList.remove('show');

  const form = document.getElementById('review_form');
  form.reset();
  // Set focus back to element that had it before the modal was opened
  focusedElementBeforeModal.focus();
};

// Star Rating Control
const setFocus = (evt) => {
  const rateRadios = document.getElementsByName('rate');
  const rateRadiosArr = Array.from(rateRadios);
  const anyChecked = rateRadiosArr.some(radio => { return radio.checked === true; });
  // console.log('anyChecked', anyChecked);
  if (!anyChecked) {
    const star1 = document.getElementById('star1');
    star1.focus();
    // star1.checked = true;
  }
};

const navRadioGroup = (evt) => {
  // console.log('key', evt.key, 'code', evt.code, 'which', evt.which);
  // console.log(evt);
  
  const star1 = document.getElementById('star1');  
  const star2 = document.getElementById('star2');  
  const star3 = document.getElementById('star3');  
  const star4 = document.getElementById('star4');  
  const star5 = document.getElementById('star5');  

  if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(evt.key)) {
    evt.preventDefault();
    // console.log('attempting return');
    if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') {
      switch(evt.target.id) {
        case 'star1':
          star2.focus();
          star2.checked = true;
          break;
        case 'star2':
          star3.focus();
          star3.checked = true;
          break;
        case 'star3':
          star4.focus();
          star4.checked = true;
          break;
        case 'star4':
          star5.focus();
          star5.checked = true;
          break;
        case 'star5':
          star1.focus();
          star1.checked = true;
          break;
      }
    } else if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') {
      switch(evt.target.id) {
        case 'star1':
          star5.focus();
          star5.checked = true;
          break;
        case 'star2':
          star1.focus();
          star1.checked = true;
          break;
        case 'star3':
          star2.focus();
          star2.checked = true;
          break;
        case 'star4':
          star3.focus();
          star3.checked = true;
          break;
        case 'star5':
          star4.focus();
          star4.checked = true;
          break;
      }
    }
  }
};
