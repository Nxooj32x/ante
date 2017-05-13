define('view/left/leftDecoration', function(require, exports, module)  {

    var Draggable = require('common/draggable/draggable');
    var transform = require("common/transform/transform");
    var SizeConverter = require('common/size-converter/size-converter');
    var Event = require("common/event/event");

    var sizeConverter = new SizeConverter(108);

    var $leftDecorationMain = $('#left-decoration-main');
    var $leftDecorationSystemList = $('#left-decoration-system-list');
    var $leftDecorationUserList = $('#left-decoration-user-list');

    function init() {
        initTag();

        initAdminList();
        initUserList();
    }

    function initTag() {
        var tags = ["全部"];
        if (typeof systemDeTag != undefined && systemDeTag != "") {
            tags = systemDeTag.split(",");
        }

        var h = "";
        $.each(tags, function(i, tag) {
            if (tag == "全部") {
                h += '<li class="active">' + tag + '</li>';
            } else {
                h += '<li >' + tag + '</li>';
            }
        });

        $('#left-decoration-tag ul').empty().append(h);
    }

    function initDecorationList($list, decorations) {
        var t = $('#decoration-li-template').html();
        $.each(decorations, function(i, d) {
            var $temp = $(t);

            $temp.data('decoration', d);
            $temp.attr('data-id', d.id);
            $temp.find('img').attr('src', d.value + "?imageView2/2/w/100");

            $list.append($temp);
        })
    }

    function initAdminList() {
        var tag = $('#left-decoration-tag li.active').text();
        var decorationList = decorationPool.getByTag(tag);
        $leftDecorationSystemList.empty();
        if (decorationList.length == 0) {
            $leftDecorationSystemList.append($('#empty').html());
        } else {
            initDecorationList($leftDecorationSystemList, decorationList);
        }
        $('#left-decoration-total-system-num').text(decorationList.length);
    }

    function initUserList() {
        var decorationList = decorationPool.getUser();
        $leftDecorationUserList.empty();
        if (decorationList.length == 0) {
            $leftDecorationUserList.append($('#empty').html());
        } else {
            initDecorationList($leftDecorationUserList, decorationList);
        }

        $('#left-decoration-total-user-num').text(decorationList.length);
    }

    function initDecorationDragEvent() {
        var draggable = new Draggable('#left-decoration-main .decorate_main_box ', 'li', 10, 0, false);

        var img;
        draggable.dragStart.register(function (e) {
            if (e.event.type.indexOf('touch') > -1) { //触摸下如果是纵向拖拽
                if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    e.prevent();
                    return;
                } else {
                    e.event.preventDefault();
                }
            }

            var curTar = $(e.currentTarget);

            if (curTar.attr("is-loading")) {
                e.prevent();
                return;
            }

            curTar.data('click', false);

            var thumbnail = curTar.children('img');
            if (thumbnail.length === 0) {
                e.prevent();
                return;
            }

            var decoration = curTar.data('decoration');
            img = thumbnail.clone();
            img.data('decoration', decoration);

            img.css({
                position: 'absolute',
                'z-index': 100,
                top: 0,
                left: 0,
                visibility: 'hidden',
                'backface-visibility:': 'hidden'
            }).addClass('photo-drag-thumb');

            //img[0].getContext('2d').drawImage(curImg[0], 0, 0);

            $('body').addClass('dragging-decoration');
            img.appendTo('body');

            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();

            transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));

            img.css({
                visibility: 'visible'
            });

            $("#section_book_edit").attr("data-strike", "true");
        });
        draggable.drag.register(function (e) {
            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();
            if (imgOuterWidth * imgOuterHeight > 0) {
                img.css('visibility', 'visible');
                transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));
            }

            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            img.data('cushionClockToken', setTimeout(function () {
                img.css('display', 'none');
                var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(), e.pageY - $(window).scrollTop()));
                img.css('display', 'block');
            }, 1000 / 60));
        });
        draggable.dragEnd.register(function (e) {
            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            var decoration = img.data('decoration');
            img.remove();
            img = null;

            var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(),
                e.pageY - $(window).scrollTop()));

            var page;
            var pageSeq, pageRect, bookScale;

            if (element.is('.page, .page *')) {
                page = element.hasClass('page') ? element : element.parents('.page');
                pageSeq = page.attr('data-seq');
                pageRect = view.edit.getPageRect(page, true);
                bookScale = view.edit.getBookCurrentScale();

                var activePageSeq = view.edit.getActivePageSeq();
                if ((activePageSeq != "flyleaf" && activePageSeq != "copyright")){
                    opEvent.eNewDecorationInsert.trigger(exports, {
                        decoration: decoration,
                        pageSeq: pageSeq,
                        x: sizeConverter.pxToMm((e.pageX - pageRect.left) / bookScale),
                        y: sizeConverter.pxToMm((e.pageY - pageRect.top) / bookScale)
                    });
                }
            }

            $('body').removeClass('dragging-decoration');

            $("#section_book_edit").attr("data-strike", "false");
        });
    }


    function bind() {
        $leftDecorationMain.unbind('click').on('click', '#decorationUpload', function() {
            opEvent.ePopUpload.trigger(exports, {
                type : 'decoration',
                onUpload : function(ir, cb) {
                    Api.material.addUser(Api.material.createDecoration(ir), function(addDecoration) {
                        decorationPool.addOne(addDecoration);
                        cb(ir);
                    });
                },
                onClose: function() {
                    init();
                },
                check:  function(file, bookId, existCb, noExistCb ) {
                    decorationPool.isExist(file, bookId, existCb, noExistCb);
                }
            })
        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $decorationLi = $(this).parent();
            var decoration = $decorationLi.data('decoration');
            Api.material.del(decoration.id, function() {
                decorationPool.deleteOne(decoration.id);
                init();
                SureMsg.success("删除成功");
            });

        }).on('click', '#left-decoration-tag li', function(e) {
            $(this).addClass('active').siblings().removeClass('active');
            initAdminList()
        });

        initDecorationDragEvent();
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        eNewDecorationInsert : new Event()
    };


    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
});