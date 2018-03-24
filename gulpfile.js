/* eslint-env node */

'use strict';

var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var del = require('del');
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
var htmlhint = require("gulp-htmlhint");
var wiredep = require('wiredep').stream;
var useref = require('useref');
var nunjucksRender = require('gulp-nunjucks-render');

var serve = {
  server: {
    baseDir: '.tmp',
    routes: {
      '/bower_components': 'bower_components',
      '/assets/images': 'src/assets/images',
      '/assets/libs': 'src/assets/libs'
    }
  },
  host: 'localhost',
  port: 3000,
  open: false,
    // tunnel: "geminis",
    logPrefix: "Geminis"
  };

  var serveDist = {
    server: {
      baseDir: './.tmp',
      directory: true
    },
    host: 'localhost',
    port: 3001,
    https: true,
    // tunnel: "geminis",
    logPrefix: "Geminis"
  };


  gulp.task('html:light', function () {
    gulp.src(path.src.html + '*.html') //Выберем файлы по нужному пути
    .pipe(nunjucksRender({
              path: [path.src.html + 'blocks'] // String or Array
            }))
    .pipe(htmlhint())
    .pipe(htmlhint.reporter('htmlhint-stylish'))
    .pipe(wiredep())
        // .pipe($.changed(path.tmp.html)) //Выплюнем их в папку temp
        .pipe(gulp.dest(path.tmp.html))
      });

  gulp.task('html', ['styles', 'scripts'], function () {
    gulp.src(path.src.html + '*.html') //Выберем файлы по нужному пути
    .pipe(nunjucksRender({
              path: [path.src.html + 'blocks'] // String or Array
            }))
    .pipe(wiredep({
      // exclude: ['bootstrap-sass']
    }))
    .pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.base64({
      extensions: ['svg', 'png'],
          maxImageSize: 8*1024, // bytes 
        })))
    .pipe($.if(/\.css$/, $.postcss([csso])))
        // Minify any HTML
        .pipe($.if('*.html', $.htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        })))
        .pipe(gulp.dest(path.dist.html))
      });

  gulp.task('ajax', function () {
   return gulp.src('src/ajax/*.html')
   .pipe(gulp.dest('.tmp/ajax/'))
   .pipe(gulp.dest('dist/ajax/'))
 })

  gulp.task('scripts', function () {
   gulp.src(path.src.js + '*.js')
   .pipe($.babel())
    // Output files
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest(path.tmp.js))
    .pipe(browserSync.stream({once: true}));
  });

  var processors = [
  autoprefixer({
    browsers: ['last 4 versions']
  }),
  mqpacker({
    sort: sortMediaQueries
  })
  ];

  gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(path.src.styles + "*.scss") //Выберем наш main.css
    .pipe($.newer(path.dist.styles))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 5
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(path.tmp.styles))
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

// Sprites

var config                  = {
  mode: {
    symbol: {
      sprite: "assets/images/sprite.svg",
      dest            : '.',
      bust: false,
      prefix          : ".svg-%s",
            // dimensions      : false,
            render: {
              scss: {
                dest:'../src/assets/styles/_sprites.scss'
                    // template: assetsDir + "sass/templates/_sprite_template.less"
                  }
                }
              }
            }
          }


          gulp.task('svgsprites', function () {
            return gulp.src(path.src.img + 'icons/*.svg')
            .pipe($.svgSprite(config))
            .pipe(gulp.dest(path.tmp.html))
            .pipe(gulp.dest(path.dist.html));
          });

          gulp.task('image:copy', function() {
            return gulp.src(path.src.img + '**/*.*')
            .pipe($.newer(path.tmp.img))
            .pipe(gulp.dest(path.tmp.img))
          })

          gulp.task('image:min', function () {

    return gulp.src(path.src.img + '**/*.*') //Выберем наши картинки
    .pipe($.imagemin([MozJpeg({
      quality: 80
    })]))
    .pipe(gulp.dest(path.dist.img)) //И бросим в build
    .pipe($.size({title: 'images'}))
  });

          gulp.task('fonts', function() {
           gulp.src(path.src.fonts)
           .pipe(gulp.dest(path.tmp.fonts))
           .pipe(gulp.dest(path.dist.fonts))
         });


          gulp.task('light', [
           'ajax',
           'html:light',
           'svgsprites',
           'scripts',
           'styles',
           'fonts',
   // 'image:copy'
   ]);

          gulp.task('full', [
           'ajax',
           'html',
           'svgsprites',
 // 'scripts',
 // 'styles',
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
  .pipe(conn.dest('/013-gardian.gem-test.ru'));
});

gulp.task('clean', function () {
  del(['dist/*','.tmp/*'], {dot: true});
});

gulp.task('njk-watch', ['html:light'], function (done) {
  setTimeout(function() {
    browserSync.reload();
    done();
  }, 500)
});


gulp.task('default', ['light'], function() {
  browserSync.init(serve);

  gulp.watch(path.src.styles + '*.scss', ['styles']);
  gulp.watch('src/ajax/*.html', ['ajax']);
  gulp.watch(path.src.html + '**/*.html', ['njk-watch']);
  gulp.watch(path.src.js + '*.js', ['scripts']);
  gulp.watch(path.src.img + '**/*.*', ['image:copy']);
  gulp.watch(path.src.img + 'icons/*.svg', ['svgsprites']);
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

gulp.task('build:serve', ['build'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:only', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});