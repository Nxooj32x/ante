define('view/left/leftTemplate', function(require, exports, module)  {

    var Event = require("common/event/event");
    var canvasUtil = require('editor/util/canvas');
    var pageUtil = require('editor/util/pageUtil');
    var SizeConverter = require('common/size-converter/size-converter');
    var sizeConverter = new SizeConverter(108);


    var $lefTemplateMain = $('#left-template-main');
    var $leftTemplateList = $('#left-template-list');

    function init() {
        $('#left-template-main select').chosen({
            placeholder_text : "请选择",
            no_results_text : "无",
            disable_search : true
        });

        initAdminTemplateList();
    }

    function initTemplateList($list, tpls) {

        var t = $('#left-template-item').html();
        $.each(tpls, function(i, tpl) {
            var $temp = $(t);

            $temp.data('tpl', tpl);
            $temp.attr('data-id', tpl.id);

            var pageInfo = tpl.resource;

            if (tpl.thumbnail != null) {
                var imgThumbnail = $temp.find('img.page_thumbnail')[0];

                var height = sizeConverter.mmToPx(pageInfo.height) * 90 / sizeConverter.mmToPx(pageInfo.width);
                if (Math.floor(imgThumbnail.height) !== Math.floor(height)) {
                    $(imgThumbnail).attr('src', tpl.thumbnail).css({
                        width : 90,
                        height: height
                    });
                }

                $temp.css({
                    height : height
                }).find('canvas').remove();

            } else {
                var canvasThumbnail = $temp.find('canvas.page_thumbnail')[0];

                var height = sizeConverter.mmToPx(pageInfo.height) * 90 / sizeConverter.mmToPx(pageInfo.width);
                if (Math.floor(canvasThumbnail.height) !== Math.floor(height)) {
                    $(canvasThumbnail).attr({
                        width : 90,
                        height: height
                    });
                }

                $temp.css({
                    height : height
                }).find('img').remove();

                canvasUtil.generatePreviewCanvas(pageInfo, {}, function (e) {
                    var canvas = e.canvas;

                    var context = canvasThumbnail.getContext('2d');
                    var resultCanvas = pageUtil.scaleImage(canvas, canvasThumbnail.width, canvasThumbnail.height);

                    context.drawImage(resultCanvas, 0, 0);

                    //更新缩略图
                    if (tpl.thumbnail == null) {
                        canvasUtil.generateThumbnail(pageInfo, {}, function(e) {
                            var ir = e.ir;
                            Api.template.updatePageTemplate(tpl.id, {
                                thumbnail : ir.src
                            }, function(newTpl) {
                                templatePool.del(tpl.id);
                                newTpl.resource = tpl.resource;
                                templatePool.add(newTpl);
                                init();
                            });
                        }, 108);
                    }
                }, 108);
            }
            $list.append($temp);

        })
    }

    function initAdminTemplateList(page) {
        var imgSelectNum = $('#left-template-main select').val();
        var type = page;
        if (page == undefined) {
            type = view.edit.getActivePage().attr('data-type');
        } else {
            type = page.type;
        }

        var tplList = templatePool.getAll(imgSelectNum, type);
        $leftTemplateList.empty();
        if (tplList.length == 0) {
            $leftTemplateList.append($('#empty').html());
        } else {
            initTemplateList($leftTemplateList, tplList);
        }
        $('#left-template-num').text(tplList.length);
    }


    function bind() {
        $lefTemplateMain.unbind('click').on('click', '.left-template-li', function() {
            var tpl = $(this).data('tpl');

            opEvent.eTemplateListItemSelected.trigger(exports, {
                currentPageSeq: view.edit.getActivePageSeq(),
                template:  tpl.resource
            });

        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $tplLi = $(this).parent();
            var tpl = $tplLi.data('tpl');

            Api.template.delPageTemplate(tpl.id, function() {
                templatePool.del(tpl.id);

                init();
                SureMsg.success("删除成功");
            });
        }).on('change', 'select', function() {
            initAdminTemplateList();
        });
    }


    var events =  {
        eTemplateListItemSelected : new Event()
    };

    function initEvent() {
        opEvent.ePageListItemSelected.register(function(e) {
            var pageSeqs = e.pageSeqs,
                selectedPageSeq = e.selectedPageSeq;

            if (selectedPageSeq === undefined) {
                selectedPageSeq = pageSeqs[0];
            }
            var page = model.book.getPageBySeq(selectedPageSeq);

            initAdminTemplateList(page);
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;
});