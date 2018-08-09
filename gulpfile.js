var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();

var fs = require('fs');
var replace = require('gulp-string-replace');

var paths = {
  src: 'app/**/*',
  srcHTML: 'app/**/*.html',
  srcCSS: 'app/**/*.css',
  srcJS: 'app/**/*.js',
  // srcJS: 'app/js/*.js',

  tmp: 'tmp', // tmp folder
  tmpIndex: 'tmp/index.html', // index.html in tmp folder
  tmpCSS: 'tmp/**/*.css', // css files in tmp folder
  tmpJS: 'tmp/**/*.js', // js files in tmp folder

  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distJS: 'dist/**/*.js'
};

// gulp.task('default', ['clean','copy', 'lint', 'js', 'sw'], function () {
gulp.task('default', ['copy', 'lint', 'js'], function () {
  
  // browserSync.init({
  //   server: paths.tmp,
  //   port: 8000
  // });
  
  // gulp.watch(paths.srcJS, ['js-watch']);
});

// dev server
gulp.task('watch', function () {
  browserSync.init({
    server: paths.tmp,
    port: 8000
  });
  
  gulp.watch(paths.srcJS, ['js-watch']);
});

// build & watch 
gulp.task('watch-all', ['copy', 'js', 'watch']);

// create a task that ensures the `js` task is complete before reloading browsers
// gulp.task('js-watch', ['js','sw'], function (done) {
gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});

// Clean output directory
gulp.task('clean', function () {
  del(['tmp/*', 'dist/*']); // del files rather than dirs to avoid error
});

// Copy HTML
gulp.task('html', function () {
  var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');

  return gulp.src(paths.srcHTML)
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(gulp.dest(paths.tmp));
});
// Copy CSS
gulp.task('css', function () {
  return gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.tmp));
});
// Copy JS
gulp.task('js', function () {
  return gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'css', 'js']);