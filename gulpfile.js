var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
// var $ = require('gulp-load-plugins')();

// var clean_css = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
// var sourcemaps = require('gulp-sourcemaps');
// var uglify = require('gulp-uglify'); // ES5 only
var uglify = require('gulp-uglify-es').default; // ES6
var size = require('gulp-size');
var babel = require('gulp-babel');
var eslint = require('gulp-eslint');
var useref = require('gulp-useref');
var gIf = require('gulp-if');

var fs = require('fs');
var replace = require('gulp-string-replace');
var responsive = require('gulp-responsive');


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

// build
// gulp.task('default', ['clean','copy', 'lint', 'js', 'sw'], function () {
gulp.task('default', ['copy', 'lint', 'js', 'sw']);

/* 
gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});
gulp.task('useref1', function(){
  return gulp.src('app/index.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    // .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});
gulp.task('useref2', function(){
  return gulp.src('app/restaurant.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    // .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});
 */

// used for testing js build
var gu = require('gulp-util');
gulp.task('concat', function () {
  del(['tmp1/*', 'tmp2/*']);
  return gulp.src('app/**/*.js')
    .pipe(concat('script.min.js'))  // minified js file name
    .pipe(babel())
    // .pipe(uglify())
    .on('error', function (err) { gu.log(gu.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('./tmp1/'));
});

// serve & watch
gulp.task('serve', function () {
  browserSync.init({
    server: paths.tmp,
    port: 8000
  });

  gulp.watch(paths.srcJS, ['js-watch']);
});

// build, serve, & watch
gulp.task('serve:build', ['copy', 'lint', 'js', 'sw', 'serve']);

// this task ensures the `js` task is complete before reloading browsers
gulp.task('js-watch', ['lint', 'js', 'sw'], function (done) {
  browserSync.reload();
  done();
});

// Clean output directory
gulp.task('clean', function () {
  del(['tmp/*', 'dist/*']); // del files rather than dirs to avoid error
});


// gulp.task('useref', function(){
//   return gulp.src('app/*.html')
//     .pipe(useref())
//     // Minifies only if it's a JavaScript file
//     .pipe(gulpIf('*.js', uglify()))
//     .pipe(gulp.dest('dist'));
// });
// HTML
gulp.task('html', function () {
  var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');

  return gulp.src(paths.srcHTML)
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(gulp.dest(paths.tmp));
});
// CSS
gulp.task('css', function () {
  return gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.tmp));
});
// JS
gulp.task('js', function () {
  return gulp.src(paths.srcJS)
    .pipe(babel())
    .pipe(uglify())
    .pipe(size({title: 'scripts'}))
    .pipe(gulp.dest(paths.tmp));
});
// Service Worker
gulp.task('sw', function () {
  var bundler = browserify('./app/sw.js'); // ['1.js', '2.js']

  return bundler
    .transform(babelify)    // required for ES6 'import' syntax
    .bundle()               // combine code
    .pipe(source('sw.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugin
    .pipe(uglify())      // condense & minify
    .pipe(size({title: 'sw'}))           // outputs file size to console
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'css']);

gulp.task('lint', function () {
  return gulp.src(paths.srcJS)
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

gulp.task('styles', function () {
  return gulp.src('app/css/*.css')
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});