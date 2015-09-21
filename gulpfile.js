
'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    del = require('del');

gulp.task('mocha', function() {
    return gulp.src('./test/index.html')
        .pipe(plugins.mochaPhantomjs({reporter: 'spec'}));
});

gulp.task('jshint', function() {
    return gulp.src(['lib/**/*.js' , 'gulpfile.js'])
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});

gulp.task('jscs', function() {
    return gulp.src(['lib/**/*.js' , 'gulpfile.js'])
        .pipe(plugins.jscs())
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});

gulp.task('test', ['jshint', 'jscs', 'mocha']);

gulp.task('doc', function() {
    gulp.src('./src/**/*.js')
        .pipe(plugins.jsdoc('./doc'));
});

gulp.task('uglify', function() {
    return gulp.src('src/**/*.js')
        .pipe(plugins.uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    del(['dist/', 'doc/']).then(function (paths) {
        console.log('Cleaned paths:\n', paths.join('\n'));
    });
});

gulp.task('build', ['clean', 'test', 'doc', 'uglify']);

function watch() {
    gulp.watch(['src/**/*.js', 'src/**/*.html', 'test/**/*.js', 'test/**/*.html'], ['test', 'doc', browserSync.reload]);
}


gulp.task('serve:test', function() {
    browserSync({
        notify: false,
        server: {
            baseDir: './',
            index: 'test/index.html'
        }
    });

    watch();
});

