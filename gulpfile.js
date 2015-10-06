'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync'),
  browserify = require('browserify'), // Consider using watchify
  del = require('del');

gulp.task('mocha', function() {
  return gulp.src('test/index.html')
    .pipe(plugins.mochaPhantomjs({
      reporter: 'spec',
      localToRemoteUrlAccessEnabled: true,
      localUrlAccessEnabled: true
    }));
});

gulp.task('jshint', function() {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('jscs', function() {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(plugins.jscs())
    .pipe(plugins.jscs.reporter());
});

gulp.task('test', ['jshint', 'jscs', 'mocha']);

gulp.task('doc', plugins.shell.task([
  'jsdoc -d ./dist/doc ./src/**/*.js ./src/*.js'
]));

gulp.task('browserify', function() {
  var bundleStream = browserify([], pkg.browserify).bundle();

  bundleStream
    .pipe(source('pubfood.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(plugins.rename('pubfood.js'.replace('.js', '.min.js')))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function() {
  del(['dist/']).then(function(paths) {
    console.log('Cleaned paths:\n', paths.join('\n'));
  });
});

gulp.task('build', ['browserify', 'test', 'doc']);

gulp.task('dist-js', ['browserify'], browserSync.reload);

gulp.task('serve', function() {
  browserSync({
    reloadDelay: 2000,
    notify: false,
    server: {
      baseDir: './',
      index: 'test/index.html'
    }
  });

  gulp.watch(['src/**/*.js', 'src/**/*.html', 'test/**/*.js', 'test/**/*.html'], ['dist-js']);

});
