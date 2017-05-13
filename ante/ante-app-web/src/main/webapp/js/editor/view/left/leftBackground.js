define('view/left/leftBackground', function(require, exports, module)  {

    var SizeConverter = require('common/size-converter/size-converter');
    var sizeConverter = new SizeConverter(108);

    var Event = require("common/event/event");

    var $leftBackgroundMain = $('#left-background-main');
    var $leftBackgroundSystemList = $('#left-background-system-list');
    var $leftBackgroundUserList = $('#left-background-user-list');

    function init() {
        initTag();

        initAdminList();
        initUserList();
    }

    function initTag() {
        var tags = ["全部"];
        if (typeof systemBgTag != undefined && systemBgTag != "") {
            tags = systemBgTag.split(",");
        }

        var h = "";
        $.each(tags, function(i, tag) {
            if (tag == "全部") {
                h += '<li class="active">' + tag + '</li>';
            } else {
                h += '<li >' + tag + '</li>';
            }
        });

        $('#left-background-tag ul').empty().append(h);
    }

    function initBackgroundList($list, backgrounds) {
        var t = $('#left-background-list-template').html();
        $.each(backgrounds, function(i, d) {
            var $temp = $(t);

            $temp.data('background', d);
            $temp.attr('data-id', d.id);
            $temp.find('img').attr('src', d.value + "?imageView2/2/w/100");

            $list.append($temp);
        })
    }

    function initAdminList() {
        var tag = $('#left-background-tag li.active').text();
        var bgList = backgroundPool.getByTag(tag);
        $leftBackgroundSystemList.empty();
        if (bgList.length == 0) {
            $leftBackgroundSystemList.append($('#empty').html());
        } else {
            initBackgroundList($leftBackgroundSystemList, bgList);
        }
        $('#left-background-total-system-num').text(bgList.length);
    }

    function initUserList() {
        var bgList = backgroundPool.getUser();
        $leftBackgroundUserList.empty();
        if (bgList.length == 0) {
            $leftBackgroundUserList.append($('#empty').html());
        } else {
            initBackgroundList($leftBackgroundUserList, bgList);
        }
        $('#left-background-total-user-num').text(bgList.length);
    }

    function bind() {
        $leftBackgroundMain.unbind('click').on('click', '#backgroundUpload', function() {
            opEvent.ePopUpload.trigger(exports, {
                type : 'background',
                onUpload : function(ir, cb) {
                    Api.material.addUser(Api.material.createBackground(ir), function(addBackground) {
                        backgroundPool.addOne(addBackground);
                        cb(ir);
                    });
                },
                onClose: function() {
                    init();
                },
                check:  function(file, bookId, existCb, noExistCb ) {
                    backgroundPool.isExist(file, bookId, existCb, noExistCb);
                }
            })
        }).on('click', '.left-background-item', function() {
            var bg = $(this).data('background');
            var thumb = $(this).find('img').attr('src');

            opEvent.eNewShadingInsert.trigger(exports, {
                bg : bg,
                pageSeq: view.edit.getActivePageSeq(),
                shadingId: bg.id,
                shadingEdit: bg.url,
                shadingThumb: thumb,
                imgWidth: sizeConverter.pxToMm(bg.width)
            });

        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $backgroundLi = $(this).parent();
            var background = $backgroundLi.data('background');

            Api.material.del(background.id, function() {
                backgroundPool.deleteOne(background.id);

                init();
                SureMsg.success("删除成功");
            });
        }).on('click', '#left-background-tag li', function(e) {
            $(this).addClass('active').siblings().removeClass('active');
            initAdminList()
        });
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        eNewShadingInsert : new Event()
    };


    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
});