/* eslint-env node */

'use strict';

var gulp = require('gulp');
import gulpLoadPlugins from 'gulp-load-plugins';
var browserSync = require("browser-sync");
var runSequence = require('run-sequence');
var del = require('del');
var reload = browserSync.reload;
const $ = gulpLoadPlugins();

var autoprefixer = require('autoprefixer');

var critical = require('critical');

var path = require('./package.json').config;


var config = {
	server: "./dist",
	host: 'localhost',
	port: 8081,
	logPrefix: "Geminis"
};

// Generate & Inline Critical-path CSS
gulp.task('critical', ['styles'], function (cb) {
    critical.generate({
        base: 'dist',
        src: 'http://firstwp/',
        dest: 'inc/critical.css',
        ignore: ['@font-face'],
        dimensions: [{
          width: 320,
          height: 480
        },{
          width: 768,
          height: 1024
        },{
          width: 1280,
          height: 960
        }],
        minify: true
    });
});

gulp.task('html', function () {
    gulp.src(path.app.html) //Выберем файлы по нужному пути
        .pipe($.rigger())  //Прогоним через rigger
        .pipe(gulp.dest('.tmp'))
        // Minify any HTML
        .pipe($.if('*.html', $.htmlmin({
        	removeComments: true,
        	collapseWhitespace: true,
        	collapseBooleanAttributes: true,
        	removeAttributeQuotes: true,
        	removeRedundantAttributes: true,
        	removeEmptyAttributes: true,
        	removeScriptTypeAttributes: true,
        	removeStyleLinkTypeAttributes: true,
        	removeOptionalTags: true
        })))
        .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку build
    });


gulp.task('scripts', function () {
	gulp.src([
      //other scripts
      './app/scripts/main.js'
      //other scripts
    ]) //Найдем наш main файл
	.pipe($.newer(path.dist.scripts))
	.pipe($.sourcemaps.init())
	.pipe($.babel())
	.pipe($.sourcemaps.write())
	.pipe($.concat('main.js'))
	.pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(path.dist.scripts))
      .pipe(browserSync.stream());
  });


gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(path.app.styles) //Выберем наш main.css
    .pipe($.newer(path.dist.styles))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
    	precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss([ autoprefixer() ]))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist.styles))
    .pipe(browserSync.stream());
});

gulp.task('image:copy', function() {
    return gulp.src(path.app.images)
    .pipe($.newer(path.dist.images))
    .pipe(gulp.dest(path.dist.images))
    .pipe(browserSync.stream());
})

gulp.task('image:min', function () {

    return gulp.src(path.app.images) //Выберем наши картинки
    .pipe($.cache($.imagemin({
    	progressive: true,
    	interlaced: true
    })))
        .pipe(gulp.dest(path.dist.images)) //И бросим в build
        .pipe($.size({title: 'images'}))
    });

gulp.task('fonts', function() {
	gulp.src(path.app.fonts)
	.pipe(gulp.dest(path.dist.fonts))
});


gulp.task('light', [
	'html',
	'scripts',
	'styles',
	'fonts',
	'image:copy'
	]);

gulp.task('build', [
	'html',
	'scripts',
	'styles',
	'fonts',
	'image:min'
	]);

gulp.task('clean', function () {
	del(['dist/*'], {dot: true});
});

gulp.task('default', ['clean', 'build']);

gulp.task('serve', ['light'], function() {
    browserSync.init({
        proxy: "http://firstwp/"
    });

    gulp.watch(path.app.styles, ['styles']);
    gulp.watch(path.app.scripts, ['scripts']);
    gulp.watch(path.app.images, ['images:copy']);
    gulp.watch("dist/*.php").on('change', browserSync.reload);
    gulp.watch("dist/*.html").on('change', browserSync.reload);
});