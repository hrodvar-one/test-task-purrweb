// Подключение плагинов

const gulp =require('gulp');
const argv = require('yargs').argv
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const rename = require("gulp-rename");
const gcmq = require('gulp-group-css-media-queries');

// Подключение файла настроек

const projectConfig = require('./projectConfig.json');

// Значения путей проекта

const path = projectConfig.path;

// html
path.src.html[0] =  path.src.srcPath + path.src.html[0];

path.src.style[0] = path.src.srcPath + path.src.style[0];

path.dist.style = path.dist.distPath + path.dist.style;

path.watch = {};

// Отслеживаем все scss файлы, которые находятся в папке src
path.watch.style = [];
path.watch.style[0]  = path.src.style[0].replace( path.src.style[0].split('/').pop(), '**/*.scss' );

// Отслеживаем все html файлы, которые находятся в папке src
path.watch.html = [];
path.watch.html[0] = path.src.html[0];

// path.watch.html = ['/index.html'];

// Проверка на Dev режим

const isDev = function() {
	return !argv.prod;
}

// Проверка на Prod режим

const isProd = function() {
	return !!argv.prod;
}

// Функция поднятия веб-сервера

function browsersync() {
	browserSync.init({
		open:true,
		server: path.dist.distPath
	});
}

// Функция копирования index.html из dev в prod

function htmlCopyToDist() {
	return gulp.src('./src/index.html')
		.pipe(gulp.dest('./dist'))
		.on('end', browserSync.reload);
}

function scss(){
	return gulp.src(path.src.style)
		.pipe(gulpif(isDev(), sourcemaps.init()))
		.pipe(sass())
		.pipe(gulpif(isProd(), autoprefixer({
			grid: true
		})))
		.pipe(gulpif(isProd(), gcmq()))
		.pipe(gulpif(isDev(), sourcemaps.write()))
		.pipe(gulpif(isProd(), gulp.dest(path.dist.style)))
		.pipe(gulpif(isProd(), csso()))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(path.dist.style))
		.pipe(browserSync.reload({stream: true}))
}

function imgCopyToDist() {
	return gulp.src('./src/assets/img/**/*.*')
		.pipe(gulp.dest('./dist/assets/img'))
		// .on('end', browserSync.reload);
}

function watch() {
	gulp.watch(path.watch.html, htmlCopyToDist);
	gulp.watch(path.watch.style, scss);
}

exports.default = gulp.series(
	gulp.parallel(htmlCopyToDist, scss),
	gulp.parallel(imgCopyToDist),
	gulp.parallel(browsersync, watch)
);