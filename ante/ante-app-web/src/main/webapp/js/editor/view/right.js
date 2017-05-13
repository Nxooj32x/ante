define('view/right', function(require, exports, module) {

    var slot = require("editor/slot/slot");
    var transform = require("common/transform/transform");
    var Draggable = require('common/draggable/draggable');
    var Event = require("common/event/event");
    var SizeConverter = require('common/size-converter/size-converter');

    var sizeConverter = new SizeConverter(108);

    var rightPageInfo = "#right-page-info";

    function init() {
        $('#right-slot-attr .tab_body[data-type="page"]').empty().append($(rightPageInfo).html());
    }

    function bind() {

        $('#right-slot-attr').unbind('click').on('click', '.attr_tab > a[data-type]', function() {
            var type = $(this).attr('data-type');
            $(this).addClass('active').siblings().removeClass('active');
            $('#right-slot-attr .tab_body[data-type=' + type + ']').addClass('active')
                .siblings().removeClass('active');
        }).on('click', '.edit_btn, .edit_select_btn', function(e) {
            e.preventDefault();
            clearTooltip();

            var subBtnId = $(this).attr('data-sub-template');
            if (subBtnId != undefined) {
                var sender = $(this),
                    subBtn = $('#' + subBtnId),
                    rect = sender[0].getBoundingClientRect();

                subBtn.data('sender', sender);

                if (subBtn.css('display') !== 'none') {
                    $(document).triggerHandler('pointerdown.hideSubBtn#' + subBtnId);
                    return;
                }

                subBtn.css({
                    display: 'block',
                    visibility: 'hidden',
                    animation: 'none'
                });

                subBtn.offset({
                    left: (rect.left + 1),
                    top: (rect.bottom +7 + $(window).scrollTop() + subBtn.outerHeight(true) > $(window).height() ?
                    $(window).height() - subBtn.outerHeight(true) - 3 : (rect.bottom + $(window).scrollTop() +7))
                });

                if (subBtn.find('.select_list_box').length !== 0) {
                    var width = (rect.width - 2);
                    if(width < 60 ){
                        width = 60;
                        subBtn.offset({
                            left:(rect.left -12)
                        })
                    }
                    subBtn.css({
                        width: width
                    });

                } else if(subBtn.is('.set_opacity_box')){
                    subBtn.offset({
                        left:(rect.left -50)
                    })
                }

                subBtn.offAnimationEnd().oneAnimationEnd(function () {
                    $(document).on('pointerdown.hide.hideSubBtn#' + subBtnId, function (e) {
                        if ($(e.target).is(sender.add(sender.find('*')).add(subBtn).add(subBtn.find('*')))) {
                            return;
                        }
                        subBtn.css({
                            display: 'none'
                        });
                        subBtn.removeData('sender');
                        $(document).off('.hideSubBtn#' + subBtnId);
                    });
                }).css({
                    visibility: 'visible',
                    animation: 'jump-in 0.1s'
                });
            } else {
                var opEl =  $('body').data('opEl');

                var op = {};
                op.type = $(this).attr("data-type");
                op.value = $(this).attr("data-value");
                op.el = opEl;

                opEvent.eSlotBtnOpEvent.trigger(exports, op);
            }
        }).on('ifChanged','input[type="checkbox"]', function(e) {
            var isChecked = $(this).is(':checked');
            var type = $(this).attr("data-type");

            var opEl =  $('body').data('opEl');

            var op = {};
            op.type = type;
            op.value = isChecked;
            op.el = opEl;

            opEvent.eSlotBtnOpEvent.trigger(exports, op);
        }).on('change', 'input[type="text"], input[type="number"]', function() {
            var value = $(this).val();
            var type = $(this).attr("data-type");
            var inputType = $(this).attr('type');
            var opEl =  $('body').data('opEl');
            var valueType = $(this).attr('data-value-type');
            var isMM = $(this).parent().is('.mm');

            var op = {};
            op.type = type;
            op.isMM = isMM;

            if (inputType == 'text') {
                op.value = value;
            } else if (valueType == 'integer') {
                op.value = parseInt(value);
            } else {
                op.value = parseFloat(value).toFixed(1);
            }
            if (type == "opacity") {
                op.value = parseFloat(value / 100);
            }

            op.el = opEl;

            opEvent.eSlotBtnOpEvent.trigger(exports, op);
        }).on('click', '.j-save-as-template', function() {
            var pageSeq = view.edit.getActivePageSeq();

            opEvent.eSaveAsTemplate.trigger(exports, {
                pageSeq : pageSeq
            });
        }).on('change', 'select[data-type="fontId"]', function() {
            var opEl =  $('body').data('opEl');
            var value = $('#right-slot-attr [data-type="fontId"]').val();

            if (opEl.parent().attr('data-num') == 'front_flap') {
                slot.setAttr(opEl, {
                    fontId: value,
                    doNotAutoSetTextSlotHeight: true
                });

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: opEl.parent().attr('data-seq'),
                    name: opEl.attr('data-name'),
                    obj: {
                        fontId: value
                    }
                });
            } else {
                slot.setAttr(opEl, {
                    fontId: value
                });

                var textSlotHeight = sizeConverter.pxToMm(slot.text.getTextSlotTextHeight(opEl));

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: opEl.parent().attr('data-seq'),
                    name: opEl.attr('data-name'),
                    obj: {
                        fontId: value,
                        height: textSlotHeight
                    }
                });
            }
        });

        $('#right-slot-attr .attr_tab > a[data-type="page"]').trigger('click');
    }

    function initPageInfo(page) {
        $('#right-slot-attr .j-pageinfo[data-type="name"]').val(page.name);
        $('#right-slot-attr .j-pageinfo[data-type="width"]').val(page.width);
        $('#right-slot-attr .j-pageinfo[data-type="height"]').val(page.height);

        $('#right-slot-attr .j-pageinfo[data-type="backgroundColor"]').attr('data-value',  page.backgroundColor)
            .find('.color').css({
            'background-color' : page.backgroundColor
        });
    }

    function clearTooltip() {
        $('.simple-tooltip').remove();
    }

    function getAllFontOption(template) {
        var fonts = fontPool.getFonts();
        var $select = template.find('[data-type="fontId"]');
        $select.empty();
        $.each(fonts, function(i, font) {
            var $fontItem = $($('#right-attr-font-item').html());
            $fontItem.attr('value', font.value).css({
                'font-family': 'font' + font.value + ',serif'
            }).text(font.name);
            $select.append($fontItem);
        });
    }

    function initSlotAttrSet(el) {
        el = $(el);

        $('body').data('opEl', el);

        var rightAttrTemplateId = "#right-attr-set-slot-common";
        var commonSlotAttr = $(rightAttrTemplateId).html();

        if (slot.isTextSlot(el)) {
            rightAttrTemplateId = "#right-attr-set-slot-text";
        } else if (slot.isImageSlot(el) && !slot.isEmpty(el)) {
            rightAttrTemplateId = "#right-attr-set-slot-image";
        } else if (slot.isImageSlot(el) && slot.isEmpty(el)) {
            rightAttrTemplateId = "#right-attr-set-slot-image-empty";
        } else if (slot.isDecorationSlot(el)) {
            rightAttrTemplateId = "#right-attr-set-slot-decoration";
        } else if (slot.isShadingSlot(el)) {
            commonSlotAttr = $('#right-attr-set-slot-common-shading').html();
            rightAttrTemplateId = "#right-attr-set-slot-shading";
        } else if (slot.isShapeSlot(el)) {
            rightAttrTemplateId = "#right-attr-set-slot-shape";
        }

        commonSlotAttr += $(rightAttrTemplateId).html();

        var template = $(commonSlotAttr);

        if (slot.isTextSlot(el)) {
            getAllFontOption(template);
        }

        initSlotAttrValue(el, template);

        //clearColorPicker();

        $('#right-slot-attr .tab_body[data-type="slot"]').empty().append(template);
        $('#right-slot-attr .cm_zoombar .zoombar_cursor').each(function(){
            setOpacityAndDegX($(this));
        });
    }

    function clearColorPicker() {
        $('#right-slot-attr .tab_body[data-type="slot"]').find('.select_color').each(function() {
            var colorpickerId = $(this).data('colorpickerId');
            if (colorpickerId != null) {
                $('#' + colorpickerId).remove();
            }
        });
    }

    function initColorPicker() {
        $('#right-slot-attr').find('.select_color').each(function() {
            var color = $(this).attr('data-value');
            var colorpickerId = $(this).data('colorpickerId');
            if (colorpickerId == null) {
                $(this).ColorPicker({
                    color: color,/*默认颜色白色*/
                    onShow: function (colpkr) {
                        if($(colpkr).is(':visible')){
                            $(colpkr).fadeOut(500);
                        }else{
                            $(colpkr).fadeIn(500);
                        }
                        return false;
                    },
                    onHide: function (colpkr) {
                        $(colpkr).fadeOut(500);
                        return false;
                    },
                    onSubmit: function(hsb, hex, rgb, el) {
                        //$(el).val(hex);用于input
                        $(el).find('span').css('backgroundColor', '#' + hex);
                        $(el).ColorPickerHide();

                        var type = $(el).attr('data-type');
                        var value = '#' + hex;
                        var opEl =  $('body').data('opEl');

                        if ($(el).is('.j-pageinfo')) {
                            opEvent.eChangePageInfo.trigger(exports, {
                                seq : view.edit.getActivePageSeq(),
                                type : type,
                                value : value
                            });
                        } else {
                            if (opEl != null) {
                                opEvent.eSlotBtnOpEvent.trigger(exports, {
                                    el : opEl,
                                    type : type,
                                    value : value
                                });
                            }
                        }
                    }
                })
            }
        });
    }

    function initSlotAttrValue(el, template) {
        el = $(el);

        var attr = slot.getAttr(el);

        template.find('input[data-type="name"]').val(el.attr('data-name'));
        if (attr.locked) {
            template.find('input[data-type="locked"]').iCheck('check');
        } else {
            template.find('input[data-type="locked"]').iCheck('uncheck');
        }

        if (attr.readonly) {
            template.find('input[data-type="readonly"]').iCheck('check');
        } else {
            template.find('input[data-type="readonly"]').iCheck('uncheck');
        }

        template.find('input[data-type="opacity"]').val(attr.opacity * 100);

        template.find('input[data-type="width"]').val(sizeConverter.pxToMm(attr.width).toFixed(1));
        template.find('input[data-type="height"]').val(sizeConverter.pxToMm(attr.height).toFixed(1));
        template.find('input[data-type="x"]').val(sizeConverter.pxToMm(attr.x).toFixed(1));
        template.find('input[data-type="y"]').val(sizeConverter.pxToMm(attr.y).toFixed(1));

        template.find('input[data-type="rotation"]').val(attr.rotation);

        if (slot.isTextSlot(el)) {

            template.find('input[data-type="pt"]').val(attr.pt);
            template.find('[data-type="font-color"]')
                .val(attr.color)
                .attr('data-value', attr.color)
                .children('.color')
                .css({
                    'background-color' : attr.color
                });

            template.find('select[data-type="fontId"]').val(attr.fontId);
            template.find('input[data-type="maxLine"]').val(attr.maxLine);
            template.find('input[data-type="maxLength"]').val(attr.maxLength);
        } else if (slot.isImageSlot(el)) {
            template.find('input[data-type="borderwidth"]').val(sizeConverter.pxToPt(attr.borderWidth));

            template.find('[data-type="bordercolor"]')
                .val(attr.borderColor)
                .attr('data-value', attr.borderColor)
                .children('.color')
                .css({
                    'background-color' : attr.borderColor
                });
        } else if (slot.isShapeSlot(el)) {
            template.find('input[data-type="borderwidth"]').val(sizeConverter.pxToPt(attr.borderWidth));

            template.find('[data-type="bordercolor"]')
                .val(attr.borderColor)
                .attr('data-value', attr.borderColor)
                .children('.color')
                .css({
                    'background-color' : attr.borderColor
                });

            template.find('[data-type="color"]')
                .val(attr.color)
                .attr('data-value', attr.color)
                .children('.color')
                .css({
                    'background-color' : attr.color
                });
        }
    }

    function initZoombar() {
        //创建模板页面:透明度，旋转
        var cmZoomCursor = $('#right-slot-attr .cm_zoombar .zoombar_cursor'),
            draggableZoombar = new Draggable(cmZoomCursor);

        draggableZoombar.dragStart.register(function (e) {
            var element = $(e.currentTarget);

            var currentTransform = transform.getCurrent(element);
            element.data({
                dragStartXY: {
                    x: currentTransform.translationX,
                    y: currentTransform.translationY
                },
                click: false
            });

        });
        draggableZoombar.drag.register(function (e) {
            var element = $(e.currentTarget);
            var maxLeft = element.closest('.cm_zoombar').width() - cmZoomCursor.innerWidth();

            var dragStartXY = element.data('dragStartXY');
            var destX = dragStartXY.x + e.deltaX;

            if(destX > maxLeft){
                destX = maxLeft;
            } else if(destX < 0){
                destX = 0;
            }

            transform.translate(element, destX, 0);

            var zoomType = element.closest('.cm_zoombar').next(),
                zoomValInput = zoomType.find('.zoombar_value'),
                zoomVal;
            if(zoomType.hasClass('deg')){
                zoomVal =Math.round(destX / maxLeft * 360 - 180)
            }else if(zoomType.hasClass('percent')){
                zoomVal =Math.round(destX / maxLeft * 100)
            }
            zoomValInput.val(zoomVal);
        });
        draggableZoombar.dragEnd.register(function (e) {
            var element = $(e.currentTarget);

            var zoomType = element.closest('.cm_zoombar').next(),
                zoomValInput = zoomType.find('.zoombar_value');

            zoomValInput.trigger('change');

            element.removeData('dragStartXY');
        });
    }

    function setOpacityAndDegX(element, zoomVal){
        var cmZoombar = element.closest('.cm_zoombar'),
            maxLeft = cmZoombar.width() - element.innerWidth();

        var zoomType = element.closest('.cm_zoombar').next();
        var destX = element.closest('.cm_zoombar').next();
        zoomVal = zoomVal ? parseInt(zoomVal) : parseInt(zoomType.find('.zoombar_value').val());
        if(zoomType.hasClass('deg')){
            destX = (zoomVal + 180) / 360 * maxLeft;
        }else if(zoomType.hasClass('percent')){
            destX =zoomVal / 100 * maxLeft;
        }
        transform.translate(element, destX, 0);
    }

    function initRightEvent() {

        initZoombar();

        $('#right-slot-attr select').chosen({
            placeholder_text : "请选择字体...",
            no_results_text : "无字体",
            disable_search : true
        });

        SureUtil.changeButtonCss();

        $('#right-slot-attr  .edit_btn').simpletooltip({position: 'bottom'});
    }

    function showSetPageInfo() {
        $('#right-slot-attr .attr_tab > a[data-type="page"]').trigger('click');
    }

    function showSetSlot() {
        $('#right-slot-attr .attr_tab > a[data-type="slot"]').trigger('click');
    }

    var events =  {
        eChangeBookInfo : new Event(),
        eSaveAsTemplate : new Event()
    };

    function initEvent() {
        opEvent.eSlotSelected.register(function(e) {
            var el = e.el, multiple = e.multiple;

            showSetSlot();
            initSlotAttrSet(el, multiple);
            initRightEvent();
            initColorPicker();
        });

        opEvent.ePageListItemSelected.register(function(e) {
            var pageSeqs = e.pageSeqs,
                selectedPageSeq = e.selectedPageSeq;

            if (pageSeqs === undefined) {
                throw new Error('pageSeqs为undefined');
            }
            if (selectedPageSeq === undefined) {
                selectedPageSeq = pageSeqs[0];
            }

            var page = model.book.getPageBySeq(selectedPageSeq);
            initPageInfo(page);
            initColorPicker();
        });

        opEvent.eSlotChanged.register(function(e) {
            var el = $('body').data('opEl');
            var pageSeq = e.pageSeq,
                slotName = e.name;

            if (el.parent().attr('data-seq') == pageSeq && el.attr('data-name') == slotName) {
                opEvent.eSlotSelected.trigger(exports, {
                    el : el,
                    multiple : false
                })
            }
        })
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;

    exports.showSetPageInfo = showSetPageInfo;
    exports.showSetSlot = showSetSlot;

});