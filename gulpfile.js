"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");

gulp.task("css", function() {
    return gulp.src("source/sass/style.scss") //.pipe(функция в которую нужно передать результат предыдущих функций)
        .pipe(plumber()) // plumber(указывает ошибку если не правильно написан код)
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(postcss([  // postcss (Автопрефиксер для кросбраузерности)
            autoprefixer()
        ]))
        .pipe(csso())
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("html",function(){
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()        //Вставка svg-спрайт в разметку
  ]))
  .pipe(gulp.dest("build"));
});

//Оптимизация и удаление лишнего из картинок и svg
gulp.task("images", function(){
  return gulp.src("source/img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.mozjpeg({progressive: true}),
    imagemin.svgo()
  ]))
  .pipe(gulp.dest("source/img"));
});

//Формат для создания файла .webp
gulp.task("webp",function(){
  return gulp.src("source/img/**/*.{png,jpg}")
  .pipe(webp({quality:90}))
  .pipe(gulp.dest("source/img"));
});

//Создание спрайтов
gulp.task("sprite",function(){
  return gulp.src("source/img/icon-*svg")
  .pipe(svgstore({
    inlineSvg:true       //Удаляет ненужные комменты
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

//Запуск сервера
gulp.task("server", function() {
    server.init({
        server: "source/",  //путь до папки
        notify: false,
        open: true,
        cors: true,
        ui: false
    });
    gulp.watch("source/sass/**/*.scss", gulp.series("css"));
    gulp.watch("source/*.html").on("change", server.reload); //перезагрузка
});

gulp.task("copy",function(){
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
  ],{
    base:"source"
  })
  .pipe(gulp.dest("build"));
});

gulp.task("clean",function(){
  return del("build");
});

gulp.task("start", gulp.series("build","server"));
gulp.task("build", gulp.series("clean","copy","css", "sprite","html"));

