'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync'),
  browserify = require('browserify'), // Consider using watchify
  fs = require('fs'),
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

gulp.task('test', ['test-spec', 'test-xunit']);

gulp.task('test-spec', function() {
  return gulp.src('./test/unittestindex.js')
    .pipe(plugins.mocha({reporter: 'spec'}));
});

gulp.task('test-xunit', plugins.shell.task([
  'mocha -R "xunit" ./test/unittestindex.js > ./reports/mocha-xunit.xml'
]));

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
    .pipe(plugins.eslint.format('checkstyle', fs.createWriteStream('reports/jshint-checkstyle.xml')))
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('doc', plugins.shell.task([
  'jsdoc -R API_DOC.md -d ./dist/doc ./src -t tpl -r'
]));

gulp.task('build', function() {
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
