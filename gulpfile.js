var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync').create();
// var $ = require('gulp-load-plugins')();

var htmlmin = require('gulp-htmlmin');
var newer = require('gulp-newer');
var cssnano = require('gulp-cssnano');
var autoprefixer = require('gulp-autoprefixer');

var responsive = require('gulp-responsive');
var cache = require('gulp-cache');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
// var uglify = require('gulp-uglify'); // ES5 only
var uglify = require('gulp-uglify-es').default; // ES6
var size = require('gulp-size');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var eslint = require('gulp-eslint');
var useref = require('gulp-useref');
var lazypipe = require('lazypipe');
var gIf = require('gulp-if');

var fs = require('fs');
var replace = require('gulp-string-replace');

var reload = browserSync.reload;
// var paths = {
//   src: 'app/**/*',
//   srcHTML: 'app/**/*.html',
//   srcCSS: 'app/**/*.css',
//   srcJS: 'app/**/*.js',
//   // srcJS: 'app/js/*.js',

//   tmp: '.tmp', // tmp folder
//   tmpIndex: '.tmp/index.html', // index.html in tmp folder
//   tmpCSS: '.tmp/**/*.css', // css files in tmp folder
//   tmpJS: '.tmp/**/*.js', // js files in tmp folder

//   dist: 'dist',
//   distIndex: 'dist/index.html',
//   distCSS: 'dist/**/*.css',
//   distJS: 'dist/**/*.js'
// };

// Lint JavaScript
gulp.task('lint', function () {
  return gulp.src(['app/**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    // .pipe($.if(!browserSync.active, $.eslint.failAfterError()))  
    .pipe(eslint.failOnError());
});

// Build responsive images
gulp.task('images', ['fixed-images'], function () {
  return gulp.src('app/img/*.jpg')
    .pipe(responsive({
      '*.jpg': [
        { width: 300, rename: { suffix: '-300' }, },
        { width: 400, rename: { suffix: '-400' }, },
        { width: 600, rename: { suffix: '-600_2x' }, },
        { width: 800, rename: { suffix: '-800_2x' }, }
      ]
    }, {
      quality: 40,
      progressive: true,
      withMetadata: false,
    }))
    .pipe(gulp.dest('.tmp/img'))
    .pipe(gulp.dest('dist/img'));
});

// Copy fixed images
gulp.task('fixed-images', function () {
  return gulp.src('app/img/fixed/**')
    .pipe(gulp.dest('.tmp/img/fixed'))
    .pipe(gulp.dest('dist/img/fixed'));
});

// Prefix & minify stylesheets
gulp.task('styles', function () {
  return gulp.src('app/**/*.css')
    .pipe(sourcemaps.init())
      .pipe(autoprefixer())
      .pipe(size({title: 'styles (before)'}))
      .pipe(gIf('*.css', cssnano()))
      .pipe(size({title: 'styles (after) '}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp'))
    .pipe(gulp.dest('dist'));
});

// Transform, bundle, & minify scripts
gulp.task('scripts', function () {
  return gulp.src([
    './app/js/dbhelper.js',
    './app/js/register_sw.js',
    './app/js/main.js',
    './app/js/restaurant_info.js'
  ])
    .pipe(sourcemaps.init())
      .pipe(babel()) // adds 'use strict'
      .pipe(concat('bundle.min.js'))
      .pipe(size({title: 'scripts (before)'}))
      // .pipe(uglify())
    .pipe(size({title: 'scripts (after) '}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/js'));
});

// Process & minify HTML
gulp.task('html-old', ['styles', 'scripts'], function () {
  var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');

  return gulp.src('app/**/*.html')
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(size({title: 'html (before)'}))
    .pipe(useref({
      noAssets: true
    }))

    .pipe(gIf('*.html', htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      minifyJS: {compress: {drop_console: true}},
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))

    .pipe(gIf('*.html', size({title: 'html (after) ', showFiles: false})))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html', function () {
  var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');

  return gulp.src('app/*.html')
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(size({title: 'html (before)'}))
    .pipe(useref({},
      // lazypipe().pipe(sourcemaps.init)
      // lazypipe().pipe(babel) // no coz css
      // transforms assets before concat
    ))
    .pipe(gIf('*.css', autoprefixer()))
    .pipe(gIf('*.css', size({ title: 'styles (before)' })))
    // .pipe(gIf('*.css', cssnano()))
    .pipe(gIf('*.css', size({ title: 'styles (after) ' })))
    .pipe(gIf('*.js', babel()))
    .pipe(gIf('*.js', size({title: 'scripts (before)'})))
    // .pipe(gIf('*.js', uglify()))
    .pipe(gIf('*.js', size({title: 'scripts (after) '})))
    // .pipe(sourcemaps.write('.'))
    .pipe(gIf('*.html', htmlmin({
      removeComments: true,
      // collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      // minifyJS: {compress: {drop_console: true}},
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))

    .pipe(gIf('*.html', size({ title: 'html (after) ', showFiles: false })))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html:dist', function () {
  var apiKey = fs.readFileSync('GM_API_KEY', 'utf8');

  return gulp.src('app/*.html')
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(size({title: 'html (before)'}))
    .pipe(useref({},
      lazypipe().pipe(sourcemaps.init)
      // lazypipe().pipe(babel) // no coz css
      // transforms assets before concat
    ))
    .pipe(gIf('*.css', autoprefixer()))
    .pipe(gIf('*.css', size({ title: 'styles (before)' })))
    .pipe(gIf('*.css', cssnano()))
    .pipe(gIf('*.css', size({ title: 'styles (after) ' })))
    .pipe(gIf('*.js', babel()))
    .pipe(gIf('*.js', size({title: 'scripts (before)'})))
    .pipe(gIf('*.js', uglify()))
    .pipe(gIf('*.js', size({title: 'scripts (after) '})))
    .pipe(sourcemaps.write('.'))
    .pipe(gIf('*.html', htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      minifyJS: {compress: {drop_console: true}},
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))

    .pipe(gIf('*.html', size({ title: 'html (after) ', showFiles: false })))
    .pipe(gulp.dest('dist'));
});

// Process Service Worker
gulp.task('sw', function () {
  var bundler = browserify('./app/sw.js', {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: true})  // required for 'import'
    .bundle()               // concat
    .pipe(source('sw.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(size({ title: 'Service Worker (before)' }))
    // .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())         // minify
    .pipe(size({title: 'Service Worker (after) '}))
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('sw:dist', function () {
  var bundler = browserify('./app/sw.js', {debug: true}); // ['1.js', '2.js']

  return bundler
    .transform(babelify, {sourceMaps: true})  // required for 'import'
    .bundle()               // concat
    .pipe(source('sw.js'))  // get text stream w/ destination filename
    .pipe(buffer())         // required to use stream w/ other plugins
    .pipe(size({ title: 'Service Worker (before)' }))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())         // minify
    .pipe(size({title: 'Service Worker (after) '}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'));
});

// Clean output directories
gulp.task('clean', function () {
  return del(['.tmp/**/*', 'dist/**/*']); // del files rather than dirs to avoid error
});

// Build site
gulp.task('build-old', function (done) {
  runSequence('clean', ['images', 'lint', 'html', 'sw'], done);
});

// serve & watch
gulp.task('serve-old', ['build'], function () {
  browserSync.init({
    server: '.tmp',
    port: 8000
  });

  gulp.watch('app/**/*.js', ['js-watch']);
});


// this task ensures the `js` task is complete before reloading browsers
gulp.task('js-watch', ['lint', 'scripts', 'sw'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', function () {
  runSequence(['clean'], ['images', 'lint', 'html', 'sw'], function() {
    browserSync.init({
      server: '.tmp',
      port: 8000
    });

    gulp.watch(['app/*.html'], ['html', reload]);
    gulp.watch(['app/css/*.css'], ['html', reload]);
    gulp.watch(['app/js/*.js'], ['lint', 'html', reload]);
    gulp.watch(['app/sw.js'], ['lint', 'sw', reload]);
  });
});

gulp.task('serve:dist', function () {
  runSequence(['clean'], ['images', 'lint', 'html:dist', 'sw:dist'], function() {
    browserSync.init({
      server: 'dist',
      port: 8000
    });

    gulp.watch(['app/*.html'], ['html:dist', reload]);
    gulp.watch(['app/css/*.css'], ['html:dist', reload]);
    gulp.watch(['app/js/*.js'], ['lint', 'html:dist', reload]);
    gulp.watch(['app/sw.js'], ['lint', 'sw', reload]);
  });
});


//
// Tests
//
// used for testing js build
var gu = require('gulp-util');

gulp.task('concat', function () {
  del(['tmp1/script.js', 'tmp1/script.min.js']);
  return gulp.src('app/js/*.js')
    .pipe(concat('script.js'))  // minified js file name
    .pipe(babel())
    .pipe(gulp.dest('./tmp1'))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .on('error', function (err) { gu.log(gu.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('./tmp1'));
});

gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref({
      noAssets: true
    }))
    .pipe(gIf('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

