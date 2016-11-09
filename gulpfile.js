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
  uglify = require('gulp-uglify'),
  exit = require('gulp-exit');

gulp.task('browserify-unit-tests', function() {
  var b = browserify();
  b.add('./test/unittestindex.js');
  var bStream = b.bundle();
  bStream.pipe(source('unittests.js'))
    .pipe(gulp.dest('./test'));
});

gulp.task('test', function() {
  return gulp.src(['./test/index.js'])
    .pipe(mocha({reporter: 'spec'}))
    .pipe(exit());
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
    .pipe(header('/*! Pubfood vAPP_VERSION - Copyright (c) 2015 Pubfood (http://pubfood.org) */\n'))
    .pipe(replace('APP_VERSION', pkg.version))
    .pipe(gulp.dest('./build'))
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(rename('pubfood.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('build-js', ['build']);
