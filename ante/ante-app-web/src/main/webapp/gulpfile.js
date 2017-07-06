'use strict';

const gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    path = require('path');

function getPath(){
    return path.resolve('./');
}

gulp.task('seajs', ['index']);

gulp.task('index', function(){
    return gulp.src("./RES/js/module/main.js")
        .pipe($.seajsCombo({
            map:{
                '/RES/js/module/begin.js': getPath()+'/RES/js/module/begin.js'
            }
        }))
        .pipe(gulp.dest(getPath()+'/RES/temp'));
});

gulp.task('js', ['seajs'], function(){
    return gulp.src(getPath()+"/RES/temp/*.js")
        .pipe($.uglify())
        .pipe($.rev())
        .pipe(gulp.dest('./RES/dist/js'))
        .pipe($.rev.manifest())
        .pipe($.rename('js-manifest.json'))
        .pipe(gulp.dest('./RES/dist/rev/js'))
});

//清除原来的内容
gulp.task("cleanJs", function(){
    return gulp.src('./RES/dist/js')
        .pipe($.clean());
});

gulp.task('default', ['cleanJs'], function(){
    gulp.start('js');
});
