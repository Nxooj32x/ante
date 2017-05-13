define('editor/view', function (require, exports, module) {
    var mainv = require("view/mainv");
    var left = require("view/left");
    var right = require("view/right");
    var edit = require("view/edit");
    var pagelist = require("view/pagelist");
    var pagesort = require("view/pagesort");
    var toptool = require("view/toptool");
    var upload = require('view/pop/upload');
    var addPage = require('view/pop/addPage');
    var leftPhoto = require('view/left/leftPhoto');
    var leftPageList = require('view/left/leftPageList');
    var leftDecoration = require('view/left/leftDecoration');
    var leftBackground = require('view/left/leftBackground');
    var leftTemplate = require('view/left/leftTemplate');

    var allView = [mainv, left, right, edit, pagelist, pagesort, toptool,
        upload, addPage,
        leftPhoto, leftDecoration, leftBackground, leftTemplate];

    //如果是模板则加入侧边栏书页
    //if (isTpl)
    //    allView.push(leftPageList);

    function init(bookInfo) {

        allView.each(function(v) {

            v.init(bookInfo);

            if (typeof v.bind == 'function')
                v.bind();

            if (typeof v.events != 'undefined')
                opEvent.add(v.events);
        });
        allView.each(function(v) {
            if (typeof v.initEvent == 'function')
                v.initEvent();
        });

    }

    exports.init = init;

    exports.index = mainv;
    exports.edit = edit;
    exports.left = left;

    exports.leftPhoto = leftPhoto;
    exports.leftDecoration = leftDecoration;
    exports.leftPageList = leftPageList;
    exports.leftDecoration = leftDecoration;
    exports.leftBackground = leftBackground;
    exports.leftTemplate = leftTemplate;

    exports.right = right;
    exports.toptool = toptool;
    exports.pagelist = pagelist;
    exports.pagesort = pagesort;

    exports.upload = upload;

});
