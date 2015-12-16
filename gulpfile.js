'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream'),
  eslint = require('gulp-eslint'),
  header = require('gulp-header'),
  mocha = require('gulp-mocha'),
  rename = require('gulp-rename'),
  replace = require('gulp-replace'),
  uglify = require('gulp-uglify');

gulp.task('browserify-unit-tests', function() {
  var b = browserify();
  b.add('./test/unittestindex.js');
  var bStream = b.bundle();
  bStream.pipe(source('unittests.js'))
    .pipe(gulp.dest('./test'));
});

gulp.task('test', function() {
  return gulp.src(['./test/unittestindex.js', './test/apitestindex.js'])
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build', function() {
  var bundleStream = browserify([], pkg.browserify).bundle();
  bundleStream
    .pipe(source('pubfood.js'))
    .pipe(buffer())
    .pipe(header('/*! pubfood vAPP_VERSION | (c) pubfood | http://pubfood.org/LICENSE.txt */\n'))
    .pipe(replace('APP_VERSION', pkg.version))
    .pipe(gulp.dest('./build'))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(rename('pubfood.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-js', ['build']);
