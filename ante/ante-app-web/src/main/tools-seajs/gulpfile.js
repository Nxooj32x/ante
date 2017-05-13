var gulp = require( 'gulp' ),
    seajsCombo = require( 'gulp-seajs-combo' ),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
	through = require('through2'),
    uglify = require('gulp-uglify'),
    srcPath = '../../../src/main/webapp/',
	positon = '/test/me-app-web/src/main/webapp/js/editor';
//清除原来的内容
gulp.task("clean", function(){
    return gulp.src(srcPath+'js/editor/build/js')
        .pipe(clean());
});


gulp.task( 'seajscombo', function(){
    return gulp.src( srcPath+'js/editor/main.js' )
        .pipe( seajsCombo({map:{
        	'editor/app':positon+'/app',
        	'editor/opEvent':positon+'/opEvent',
        	'editor/presenter':positon+'/presenter',
        	'editor/view':positon+'/view',

        	'editor/api/material':positon+'/api/material',
        	'editor/api/template':positon+'/api/template',
        	'editor/api/ImageRes':positon+'/api/ImageRes',

        	'common/align/more_selection':positon+'/common/align/more_selection',
        	'common/draggable/draggable':positon+'/common/draggable/draggable',
        	'common/event/event':positon+'/common/event/event',
        	'common/imgload/imgload':positon+'/common/imgload/imgload',
        	'common/selection-handles/selection-handles':positon+'/common/selection-handles/selection-handles',
        	'common/size-converter/size-converter':positon+'/common/size-converter/size-converter',
        	'common/transform/transform':positon+'/common/transform/transform',
        	'common/zoombar/zoombar':positon+'/common/zoombar/zoombar',


        	'editor/model/book':positon+'/model/book',
           	'editor/model/index':positon+'/model/index',
        	'editor/model/photo':positon+'/model/photo',

        	'editor/pool/backgroundPool':positon+'/pool/backgroundPool',
        	'editor/pool/decorationPool':positon+'/pool/decorationPool',
        	'editor/pool/fontPool':positon+'/pool/fontPool',
        	'editor/pool/pool':positon+'/pool/pool',
        	'editor/pool/templatePool':positon+'/pool/templatePool',


        	'editor/slot/decorationSlot':positon+'/slot/decorationSlot',
        	'editor/slot/defaultSlot':positon+'/slot/defaultSlot',
        	'editor/slot/imageSlot':positon+'/slot/imageSlot',
        	'editor/slot/shadingSlot':positon+'/slot/shadingSlot',
        	'editor/slot/shapeSlot':positon+'/slot/shapeSlot',
        	'editor/slot/slot':positon+'/slot/slot',
        	'editor/slot/textSlot':positon+'/slot/textSlot',

        	'editor/util/canvas':positon+'/util/canvas',
        	'editor/util/md5':positon+'/util/md5',
        	'editor/util/pageUtil':positon+'/util/pageUtil',
        	'editor/util/uploader':positon+'/util/uploader',

        	'view/left/leftBackground':positon+'/view/left/leftBackground',
        	'view/left/leftDecoration':positon+'/view/left/leftDecoration',
        	'view/left/leftPageList':positon+'/view/left/leftPageList',
        	'view/left/leftPhoto':positon+'/view/left/leftPhoto',
        	'view/left/leftTemplate':positon+'/view/left/leftTemplate',

        	'view/pop/addPage':positon+'/view/pop/addPage',
        	'view/pop/upload':positon+'/view/pop/upload',

        	'view/edit':positon+'/view/edit',
        	'view/mainv':positon+'/view/mainv',
        	'view/left':positon+'/view/left',
        	'view/pagelist':positon+'/view/pagelist',
        	'view/pagesort':positon+'/view/pagesort',
        	'view/right':positon+'/view/right',
        	'view/sampleView':positon+'/view/sampleView',
        	'view/toptool':positon+'/view/toptool'
        	}
        }) )
        .pipe( gulp.dest(srcPath+'js/editor/build/js') );
}); 

gulp.task('js-min',['seajscombo'],function(){
    return gulp.src(srcPath+'js/editor/build/js/*.js')
       .pipe(uglify())       
       .pipe(rename({suffix:'.min'}))
       .pipe(gulp.dest(srcPath+'js/editor/build/js'));
 });

gulp.task('default',['js-min'],function(){
});