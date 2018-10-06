// if (navigator.serviceWorker) {
//   navigator.serviceWorker.register('sw.js').then(function (registration) {
//     console.log(`Registration successful, scope is ${registration.scope}`);
//   }).catch(function (error) {
//     console.log(`Service worker registration failed, error: ${error}`);
//   });
// }

// if (navigator.serviceWorker) {
//   navigator.serviceWorker.register('sw.js')
//     .then(function (registration) {
//       console.log(`Registration successful, scope is ${registration.scope}`);
//     }).catch(function (error) {
//       console.log(`Service worker registration failed, error: ${error}`);
//     });
// }

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js')
    .then(registration => {
      console.log(`Registration successful, scope is ${registration.scope}`);
    }).catch(error => {
      console.log(`Service worker registration failed, error: ${error}`);
    });
}


(function () {
  var isRobotoStyle = function (element) {

    // roboto font download
    if (element.href &&
      element.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {
      return true;
    }
    // roboto style elements
    if (element.tagName.toLowerCase() === 'style' &&
      element.styleSheet &&
      element.styleSheet.cssText &&
      element.styleSheet.cssText.replace('\r\n', '').indexOf('.gm-style') === 0) {
      element.styleSheet.cssText = '';
      return true;
    }
    // roboto style elements for other browsers
    if (element.tagName.toLowerCase() === 'style' &&
      element.innerHTML &&
      element.innerHTML.replace('\r\n', '').indexOf('.gm-style') === 0) {
      element.innerHTML = '';
      return true;
    }
    // when google tries to add empty style
    if (element.tagName.toLowerCase() === 'style' &&
      !element.styleSheet && !element.innerHTML) {
      return true;
    }

    return false;
  };

  // we override these methods only for one particular head element
  // default methods for other elements are not affected
  var head = document.getElementsByTagName('head')[0];

  var insertBefore = head.insertBefore;
  head.insertBefore = function (newElement, referenceElement) {
    if (!isRobotoStyle(newElement)) {
      insertBefore.call(head, newElement, referenceElement);
    }
  };

  var appendChild = head.appendChild;
  head.appendChild = function (textNode) {
    if (!isRobotoStyle(textNode)) {
      appendChild.call(head, textNode);
    }
  };
})();
