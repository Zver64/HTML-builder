/* eslint-env node */

'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var del = require('del');
var reload = browserSync.reload;
var csso = require('postcss-csso');
var ftp = require('vinyl-ftp');
const $ = gulpLoadPlugins();
const mqpacker = require('css-mqpacker');
var autoprefixer = require('autoprefixer');
var critical = require('critical').stream;
var pngquant = require('imagemin-pngquant');
const MozJpeg = require('imagemin-mozjpeg');
var gifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');
var path = require('./package.json').config;


var config = {
	server: "dist",
	host: 'localhost',
	port: 3001,
    // tunnel: "geminis",
    logPrefix: "Geminis",
    files: [path.dist.html + '*.html',path.dist.php + '**/*.php',path.dist.js + '*.js']
};


gulp.task('html', function () {
    gulp.src(path.src.htmlBuild) //Выберем файлы по нужному пути
        .pipe($.rigger())  //Прогоним через rigger
        .pipe(gulp.dest('.tmp'))
        // Minify any HTML
        .pipe($.if('*.html', $.htmlmin({
        	removeComments: true,
        	collapseWhitespace: true,
        	collapseBooleanAttributes: true,
        	removeEmptyAttributes: true,
        	removeScriptTypeAttributes: true,
        	removeStyleLinkTypeAttributes: true,
        })))
        .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку build
    });


gulp.task('scripts', function () {
	gulp.src([
      'src/bower/bootstrap/dist/js/bootstrap.min.js',//other scripts
      path.src.js
      //other scripts
      ])
	.pipe($.newer(path.dist.js))
	.pipe($.sourcemaps.init())
	.pipe($.babel())
    .pipe(gulp.dest('.tmp/assets/scripts/'))
    .pipe($.uglify())
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(path.dist.js))
  });

var processors = [
autoprefixer({
    browsers: ['last 4 versions']
}),
mqpacker({
    sort: sortMediaQueries
}),
csso
];
gulp.task('styles:light', function () {
  // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(path.src.styles) //Выберем наш main.css
    .pipe($.newer(path.dist.styles))
    .pipe($.sass({
        precision: 5
    }).on('error', $.sass.logError))
    .pipe($.postcss([
        autoprefixer({
            browsers: ['last 4 versions']
        }),
        mqpacker({
            sort: sortMediaQueries
        })
        ]))
    .pipe(gulp.dest('.tmp/assets/styles/'))
    // Concatenate and minify styles
    .pipe($.size({title: 'styles'}))
    .pipe(gulp.dest(path.dist.styles))
    .pipe(browserSync.stream());
});
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(path.src.styles) //Выберем наш main.css
    .pipe($.newer(path.dist.styles))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
    	precision: 5
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    // Concatenate and minify styles
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(path.dist.styles))
    .pipe(browserSync.stream());
});
function isMax(mq) {
    return /max-width/.test(mq);
}

function isMin(mq) {
    return /min-width/.test(mq);
}

function sortMediaQueries(a, b) {
    let A = a.replace(/\D/g, '');
    let B = b.replace(/\D/g, '');

    if (isMax(a) && isMax(b)) {
        return B - A;
    } else if (isMin(a) && isMin(b)) {
        return A - B;
    } else if (isMax(a) && isMin(b)) {
        return 1;
    } else if (isMin(a) && isMax(b)) {
        return -1;
    }

    return 1;
}

gulp.task('image:copy', function() {
    return gulp.src(path.src.img)
    .pipe($.newer(path.dist.img))
    .pipe(gulp.dest(path.dist.img))
})

gulp.task('image:min', function () {

    return gulp.src(path.src.img) //Выберем наши картинки
    .pipe($.imagemin([
    $.imagemin.gifsicle({interlaced: true}),
    MozJpeg(),
    $.imagemin.optipng({optimizationLevel: 5}),
    $.imagemin.svgo({plugins: [{removeViewBox: true}]})
]))
        .pipe(gulp.dest(path.dist.img)) //И бросим в build
        .pipe($.size({title: 'images'}))
    });

gulp.task('fonts', function() {
	gulp.src(path.src.fonts)
	.pipe(gulp.dest(path.dist.fonts))
});


gulp.task('light', [
	'html',
	'scripts',
	'styles:light',
	'fonts',
	'image:copy'
	]);

gulp.task('full', [
	'html',
	'scripts',
	'styles',
	'fonts',
	'image:min'
	]);

// Выгрузка изменений на хостинг
gulp.task('deploy', function() {
    var conn = ftp.create({
        host:      'piter12.dns-rus.net',
        user:      'bh61897',
        password:  'J1ehRyr1u33nycz',
        parallel:  10,
        log: $.util.log
    });
    var globs = [
    'dist/**'
    ];
    return gulp.src(globs, {buffer: false})
    .pipe(conn.dest('/010-dubai.gem-test.ru/'));
});

gulp.task('clean', function () {
	del(['dist/*','.tmp/*'], {dot: true});
});


gulp.task('default', ['light'], function() {
    browserSync.init(config);

    gulp.watch(path.src.styles, ['styles:light']);
    gulp.watch(path.src.html, ['html']);
    gulp.watch(path.src.js, ['scripts']);
    gulp.watch(path.src.img, ['image:copy']);
});

gulp.task('build', ['full']);

gulp.task('critical', ['build'], function () {
    return gulp.src('dist/*.html')
    .pipe(critical({base: 'dist/',
        inline: true,
        css: [path.dist.styles + 'main.css'],
        minify: true,
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
      ignore: ['@font-face']
  }))
    .on('error', function(err) { $.util.log($.util.colors.red(err.message)); })
    .pipe(gulp.dest('dist'));
});