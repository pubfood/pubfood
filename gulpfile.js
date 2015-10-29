'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserify = require('browserify'); // Consider using watchify

gulp.task('browserify-unit-tests', function() {
  var b = browserify();
  b.add('./test/unittestindex.js');
  var bStream = b.bundle();
  bStream.pipe(source('unittests.js'))
    .pipe(gulp.dest('./test'));
});

gulp.task('test', function() {
  return gulp.src('./test/unittestindex.js')
    .pipe(plugins.mocha({reporter: 'spec'}));
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('build', function() {
  var bundleStream = browserify([], pkg.browserify).bundle();

  bundleStream
    .pipe(source('pubfood.js'))
    .pipe(plugins.replace('APP_VERSION', pkg.version))
    .pipe(gulp.dest('./build'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(plugins.rename('pubfood.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-js', ['build']);
