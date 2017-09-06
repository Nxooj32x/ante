'use strict';

const gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    path = require('path');

function getPath(){
    return path.resolve('./');
}


//css 合并  压缩  md5
gulp.task('css', function(){
    return gulp.src('./webapp/RES/css/nprogress.css')
        .pipe($.cssimport({}))
        .pipe($.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe($.cssmin())
        .pipe($.rev())
        .pipe(gulp.dest('./webapp/RES/dist/css'))
        .pipe($.rev.manifest())
        .pipe($.rename('css-mainfest.json'))
        .pipe(gulp.dest('./webapp/RES/dist/rev/css'));
});

//清除原来的内容
gulp.task("cleancss", function(){
    return gulp.src('./webapp/RES/dist/css')
        .pipe($.clean());
});

gulp.task('seajs', ['index']);

gulp.task('index', function(){
    return gulp.src("./webapp/RES/js/module/main.js")
        .pipe($.seajsCombo({
            map:{
                '/webapp/RES/js/module/begin.js': getPath()+'/webapp/RES/js/module/begin.js'
            }
        }))
        .pipe(gulp.dest(getPath()+'/webapp/RES/temp'));
});

gulp.task('js', ['seajs'], function(){
    return gulp.src(getPath()+"/webapp/RES/temp/*.js")
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest('./webapp/RES/dist/js'))
        .pipe($.rev.manifest())
        .pipe($.rename('js-manifest.json'))
        .pipe(gulp.dest('./webapp/RES/dist/rev/js'))
});

//清除原来的内容
gulp.task("cleanJs", function(){
    return gulp.src('./webapp/RES/dist/js')
        .pipe($.clean());
});

gulp.task('default', ['cleancss','cleanJs'], function(){
    gulp.start('css','js');
});
