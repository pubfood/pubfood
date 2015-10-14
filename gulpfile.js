'use strict';

var gulp = require('gulp'),
  pkg = require('./package.json'),
  source = require('vinyl-source-stream'),
  plugins = require('gulp-load-plugins')(),
  browserSync = require('browser-sync'),
  browserify = require('browserify'), // Consider using watchify
  fs = require('fs'),
  del = require('del');

gulp.task('test', function() {
  return gulp.src('test/index.html')
    .pipe(plugins.mochaPhantomjs({
      reporter: 'spec',
      localToRemoteUrlAccessEnabled: true,
      localUrlAccessEnabled: true
    }))
    // TODO see if we can avoid the double test run somehow for the report
    .pipe(plugins.mochaPhantomjs({
      reporter: 'xunit',
      dump: 'reports/mocha-xunit.xml',
      suppressStdout: true,
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
