'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync'),
  browserify = require('browserify'), // Consider using watchify
  del = require('del'),
  runSequence = require('run-sequence');

gulp.task('mocha', function() {
  return gulp.src('test/index.html')
    .pipe(plugins.mochaPhantomjs({
      reporter: 'spec',
      localToRemoteUrlAccessEnabled: true,
      localUrlAccessEnabled: true
    }));
});

gulp.task('eslint', function() {
  return gulp.src(['src/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('test', ['eslint', 'mocha']);

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

gulp.task('build', function(cb){
  runSequence(['browserify', 'test', 'doc'], cb);
});

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
