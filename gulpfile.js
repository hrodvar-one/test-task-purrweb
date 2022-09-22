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
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const clean = require('gulp-clean');
// const del = require('del');

// Подключение файла настроек

const projectConfig = require('./projectConfig.json');

// Значения путей проекта

const path = projectConfig.path;

// Определяем массив для настройки путей шрифтов
path.src.font[0] = path.src.srcPath + path.src.font[0];
path.src.font[1] = "!" + path.src.font[0].slice(0, -6) + "src/*.*";

path.dist.font = path.dist.distPath + path.dist.font;

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

// Отслеживаем шрифты
path.watch.font = [];
path.watch.font[0] = path.src.font[0];
path.watch.font[1] = "!" + path.src.font[0].slice(0, -6) + "src/*.*";

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

// Таски для преобразования шрифтов

function ttf2woff2Converter() {
	return gulp.src(path.src.font[0].slice(0, -6) + "src/*.ttf")
		.pipe(ttf2woff2())
		.pipe(gulp.dest(path.src.font[0].slice(0, -6)));
}

function ttf2woffConverter() {
	return gulp.src(path.src.font[0].slice(0, -6) + "src/*.ttf")
		.pipe(ttf2woff())
		.pipe(gulp.dest(path.src.font[0].slice(0, -6)));
}

function otf2ttf() {
	return gulp.src(path.src.font[0].slice(0, -6) + "src/*")
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(gulp.dest(path.src.font[0].slice(0, -6) + "src"));
}

const fontsConvert = gulp.series(otf2ttf, ttf2woff2Converter, ttf2woffConverter);

exports.fontsConvert = fontsConvert;

function font() {
	return gulp.src(path.src.font)
		.pipe(gulp.dest(path.dist.font))
		.on('end', browserSync.reload);
}

// Чтобы шрифты с расширением ttf конвертировать в woff2 и woff, необходимо ввести команду:
// npm run dev fontsConvert
// После этой команды все ttf шрифты с каталога src/fonts/src преобразуются в современные форматы и скопируются в папку
// /src/assets/fonts

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

// Функция копирования img из dev в prod

function imgCopyToDist() {
	return gulp.src('./src/assets/img/**/*.*')
		.pipe(gulp.dest('./dist/assets/img'))
		.on('end', browserSync.reload);
}

// Функция копирования video из dev в prod

function videoCopyToDist() {
	return gulp.src('./src/assets/video/**/*.*')
		.pipe(gulp.dest('./dist/assets/video'))
		.on('end', browserSync.reload);
}

// Функция очистки папки dist до запуска основных скриптов

function clear() {
	return gulp.src('./dist/*', {read: false})
		.pipe(clean());
}

exports.clear = clear;

// Функция отслеживания изменения в файлах
function watch() {
	gulp.watch(path.watch.html, htmlCopyToDist);
	gulp.watch(path.watch.style, scss);
	gulp.watch(path.watch.font, font);
}

exports.default = gulp.series(
	gulp.parallel(clear),
	gulp.parallel(htmlCopyToDist, scss, font),
	gulp.parallel(imgCopyToDist),
	gulp.parallel(videoCopyToDist),
	gulp.parallel(browsersync, watch)
);