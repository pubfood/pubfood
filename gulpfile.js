'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync'),
  browserify = require('browserify'), // Consider using watchify
  del = require('del');

gulp.task('browserify-unit-tests', function() {
  var b = browserify();
  b.add('./test/unittestindex.js');
  var bStream = b.bundle();
  bStream.pipe(source('unittests.js'))
    .pipe(gulp.dest('./test'));
});

gulp.task('test-html', function() {
  return gulp.src('test/unit-test-index.html')
    .pipe(plugins.mochaPhantomjs({
      reporter: 'spec',
      localToRemoteUrlAccessEnabled: true,
      localUrlAccessEnabled: true
    }));
});

gulp.task('test', function() {
  return gulp.src('./test/unittestindex.js')
    .pipe(plugins.mocha({reporter: 'spec'}));
});

gulp.task('integration-test', function() {
  return gulp.src('test/index.html')
    .pipe(plugins.mochaPhantomjs({
      reporter: 'spec',
      localToRemoteUrlAccessEnabled: true,
      localUrlAccessEnabled: true
    }));
});

gulp.task('lint', function() {
  return gulp.src(['src/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('doc', plugins.shell.task([
  'jsdoc -R doc/API_DOC.md -d ./dist/doc ./src -t jsdoc_template -r'
]));

gulp.task('build', function() {
  var bundleStream = browserify([], pkg.browserify).bundle();

  bundleStream
    .pipe(source('pubfood.js'))
    .pipe(plugins.replace('APP_VERSION', pkg.version))
    .pipe(gulp.dest('./dist'))
    .pipe(plugins.streamify(plugins.uglify()))
    .pipe(plugins.rename('pubfood.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function() {
  del(['dist/']).then(function(paths) {
    console.log('Cleaned paths:\n', paths.join('\n'));
  });
});

gulp.task('dist-js', ['build'], browserSync.reload);

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
