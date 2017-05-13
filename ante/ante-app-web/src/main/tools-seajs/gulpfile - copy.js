var gulp = require( 'gulp' ),
    seajsCombo = require( 'gulp-seajs-combo' ),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    srcPath = '../../../src/main/webapp/';

//清除原来的内容
gulp.task("clean", function(){
    return gulp.src(srcPath+'RES/build/js')
        .pipe(clean());
});

gulp.task( 'seajscombo',['clean'], function(){
    return gulp.src( srcPath+'RES/main.js' )
        .pipe( seajsCombo({map:{
        	'me/web/app':'./../me/web/app',
        	'me/utils/backtoTop':'./../../../../me/utils/backtoTop',
        	'me/request/pajax':'./../../../../me/request/pajax'
        	}
        }) )
        .pipe( gulp.dest(srcPath+'RES/build/js') );
}); 

gulp.task('js-min',['seajscombo'],function(){
    return gulp.src(srcPath+'RES/build/js/*.js')
       .pipe(uglify())       
       .pipe(rename({suffix:'.min'}))
       .pipe(gulp.dest(srcPath+'RES/build/js'));
 });

gulp.task('default',['js-min'],function(){

});