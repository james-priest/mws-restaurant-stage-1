var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
// var $ = require('gulp-load-plugins')();

// var clean_css = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');

var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
// var concat = require('gulp-concat');
// var sourcemaps = require('gulp-sourcemaps');
// var uglify = require('gulp-uglify');
var uglify = require('gulp-uglify-es').default;
var size = require('gulp-size');
var babel = require('gulp-babel'); // probably don't need

var fs = require('fs');
var replace = require('gulp-string-replace');
var responsive = require('gulp-responsive');

var eslint = require('gulp-eslint');

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
gulp.task('default', ['copy', 'lint', 'js', 'sw'], function () {

  // browserSync.init({
  //   server: paths.tmp,
  //   port: 8000
  // });

  // gulp.watch(paths.srcJS, ['js-watch']);
});

var gu = require('gulp-util');

gulp.task('concat', function() {
  return gulp.src('app/**/*.js')
    // .pipe(concat('script.js'))
    .pipe(babel())
    .pipe(uglify())
    .on('error', function (err) { gu.log(gu.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('./tmp2/'));
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
gulp.task('watch-all', ['copy', 'lint', 'js', 'sw', 'watch']);

// create a task that ensures the `js` task is complete before reloading browsers
// gulp.task('js-watch', ['js','sw'], function (done) {
gulp.task('js-watch', ['lint', 'js', 'sw'], function (done) {
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
    .pipe(babel())
    // .pipe(uglify())
    .pipe(size())
    .pipe(gulp.dest(paths.tmp));
});
// Service Worker
gulp.task('sw', function () {
  var bundler = browserify('./app/sw.js');

  return bundler
    .transform('babelify')
    .bundle()
    .pipe(source('sw.js'))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(size())
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