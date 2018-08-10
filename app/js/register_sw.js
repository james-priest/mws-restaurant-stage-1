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