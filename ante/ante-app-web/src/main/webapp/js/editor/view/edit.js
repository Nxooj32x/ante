define("view/edit", function(require, exports, module) {
    var SizeConverter = require('common/size-converter/size-converter');
    var SelectionHandles = require("common/selection-handles/selection-handles");
    var transform = require("common/transform/transform");
    var Draggable = require('common/draggable/draggable');
    var Zoombar = require('common/zoombar/zoombar');
    var slot = require("editor/slot/slot");
    var imgload = require('common/imgload/imgload');
    var Event = require("common/event/event");

    var sizeConverter = new SizeConverter(108);
    var body = $('body'), $editWrapper = $('.edit_wrapper'),
        $bookEdit = $('.book_edit'), $bookScaleZoombar = $('#bookScaleZoombar');

    var $slotBtnChange = $('#edit-slot-btn-change'),
        $slotBtnFixed = $('#edit-slot-btn-fixed');

    var _boolScaleZoombar;


    function init() {
        $editWrapper.data('rect', $editWrapper[0].getBoundingClientRect());

        initBookScaleZoombar();

        initBookDragEvent();
        initPageSlotDragEvent();

        resetBookScaleAndPosition();
    }

    //书册放大缩小
    function initBookScaleZoombar() {
        _boolScaleZoombar = new Zoombar($bookScaleZoombar);
        _boolScaleZoombar.change.register(function (e) {
            var currentTransform = transform.getCurrent($bookEdit);

            zoomBookTo(e.scale);

            var scale = getBookCurrentScale();

            var deltaWidth = $bookEdit.width() * (scale - currentTransform.scale),
                deltaHeight = $bookEdit.height() * (scale - currentTransform.scale);

            var sectionEditOffset = $editWrapper.offset(),
                bookWidth = $bookEdit.outerWidth(),
                bookHeight = $bookEdit.outerHeight();

            var x = currentTransform.translationX - deltaWidth * ($(window).width() / 2 - sectionEditOffset.left - currentTransform.translationX) / bookWidth / currentTransform.scale,
                y = currentTransform.translationY - deltaHeight * ($(window).height() / 2 - sectionEditOffset.top - currentTransform.translationY) / bookHeight / currentTransform.scale;

            var finalXY = judgeBookXY(x, y);

            transform.translate($bookEdit, finalXY.x, finalXY.y);

            $bookEdit.children('.page').children('.slot').each(function (i, slot) {
                var selectionHandles = $(slot).data('selectionHandles');
                if (selectionHandles && selectionHandles.isOn) {
                    selectionHandles.resetPosition();
                }
            });
        });
    }

    function initBookDragEvent() {
        var draggableBook = new Draggable($bookEdit, null, 10);
        draggableBook.dragStart.register(function (e) {
            var element = $(e.currentTarget);

            if ($('body').attr('data-mode') !== 'preview' &&
                ($(e.target).is('[aria-selected=true], [aria-selected=true] *, .photo_change') ||
                $bookEdit.attr('data-locked') === 'true') ||
                $bookEdit.hasClass('scaling') ||
                $('body').hasClass('dragging-photo')
            ) {
                e.prevent();
                return;
            }

            var currentTransform = transform.getCurrent(element);
            element.data({
                dragStartXY: {
                    x: currentTransform.translationX,
                    y: currentTransform.translationY
                },
                click: false
            });

        });
        draggableBook.drag.register(function (e) {
            var element = $(e.currentTarget);

            var dragStartXY = element.data('dragStartXY');

            var destX = dragStartXY.x + e.deltaX,
                destY = dragStartXY.y + e.deltaY;

            var finalXY = judgeBookXY(destX, destY);

            transform.translate(element, finalXY.x, finalXY.y);

            if ($(e.target).is('.transformable-box,.transformable-box *')) {
                var selectionHandles;
                if ($(e.target).hasClass('transformable-box')) {
                    selectionHandles = $(e.target).data('selectionHandles');
                } else {
                    selectionHandles = $(e.target).parents('.transformable-box').data('selectionHandles');
                }
                selectionHandles.resetPosition();
            }

        });
        draggableBook.dragEnd.register(function (e) {
            var element = $(e.currentTarget);

            element.removeData('dragStartXY');
        });
    }

    function initPageSlotDragEvent() {
        var longdown = false;

        var draggableSlot = new Draggable($bookEdit, slot.getAllSlotClass());
        draggableSlot.dragStart.register(function (e) {
            if (longdown)
                e.prevent();

            var element = $(e.currentTarget);

            if (element.is('[aria-selected!="true"]')) {
                e.prevent();
                return;
            }

            element.data('click', false);

            if (element.is('.imageslot.editing')) {
                //图片框编辑模式（移动照片）
                var properties = slot.getAttr(element);
                element.children('.content').children('img').data('dragStartXY', {
                    x: properties.image.x,
                    y: properties.image.y
                });
            } else {
                //移动框

                if (element.attr('data-locked') === 'true') {
                    SureMsg.info("请先解锁元素");
                    e.prevent();
                    return;
                }

                var currentTransform = transform.getCurrent(element);

                element.data('dragStartXY', {
                    x: currentTransform.translationX,
                    y: currentTransform.translationY
                });

                element.data('selectionHandles').hide();

                $editWrapper.data('rect', $editWrapper[0].getBoundingClientRect());
            }

            refreshPageRects(element.parent());

        });
        draggableSlot.drag.register(function (e) {
            var element = $(e.currentTarget);

            var bookScale = getBookCurrentScale();

            var dragStartXY;
            var destX, destY;

            if (element.hasClass('imageslot') && element.hasClass('editing')) {
                //图片框编辑模式（移动照片）
                dragStartXY = element.children('.content').children('img').data('dragStartXY');

                var properties = slot.getAttr(element);

                var lineX = e.pageX - e.startPoint.x,
                    lineY = e.startPoint.y - e.pageY,
                    len = Math.sqrt(lineX * lineX + lineY * lineY);

                var moveRadians = Math.acos(lineY / len);
                if (e.pageX < e.startPoint.x) {
                    moveRadians = -moveRadians;
                }

                var radians = moveRadians - properties.rotation * Math.PI / 180;

                destX = dragStartXY.x + len * Math.sin(radians) / bookScale;
                destY = dragStartXY.y + len * -Math.cos(radians) / bookScale;

                slot.setAttr(element, {
                    image: {
                        x: destX,
                        y: destY
                    }
                });

                //限制图片出了槽位
                slot.image.preventImgOutSlot(element);

                element.data('backImgWrapper').css('transform', transform.getCurrentTransform(element.children('.content').children('img')));
            } else {
                //移动框
                dragStartXY = element.data('dragStartXY');

                destX = dragStartXY.x + e.deltaX / bookScale;
                destY = dragStartXY.y + e.deltaY / bookScale;

                moveSlotTo(element, destX, destY);

                autoAlignment(element, 'move');

                var rect = element[0].getBoundingClientRect();
                var page = element.siblings('.locator');
                var pageRect = page.data('rect');
                if (!pageRect) {
                    page.data('rect', pageRect = page[0].getBoundingClientRect());
                }
                var bookScale = getBookCurrentScale();

                showOrMoveSlotSizeTooltipAndSetContent(e.pageX, e.pageY, 'Ｘ：' + sizeConverter.pxToMm((rect.left - pageRect.left) / bookScale).toFixed(1) + 'mm\r\n' + 'Ｙ：'
                        + sizeConverter.pxToMm((rect.top - pageRect.top) / bookScale).toFixed(1) + 'mm');

            }
        });
        draggableSlot.dragEnd.register(function (e) {
            var element = $(e.currentTarget);
            var properties = slot.getAttr(element);

            var obj = {};
           if (slot.isImageSlot(element) && element.hasClass('editing')) {
                var img = element.children('.content').children('.img');
                obj=  {
                    image: {
                        x: sizeConverter.pxToMm(properties.image.x),
                        y: sizeConverter.pxToMm(properties.image.y)
                    }
                }
            } else  {
               obj = {
                   x: sizeConverter.pxToMm(properties.x),
                   y: sizeConverter.pxToMm(properties.y)
               }
            }
            element.data('selectionHandles').resetPosition();
            element.data('selectionHandles').show();
            opEvent.eSlotChanged.trigger(exports, {
                el : element,
                pageSeq: element.parent().attr('data-seq'),
                name: element.attr('data-name'),
                obj : obj
            });
            clearAlignment();
            hideSlotSizeTooltip();
        });
    }

    function bindPageEvent() {

        $(window).on('resize', function (e) {
            $(document).triggerHandler('pointerdown.hide');
            resetBookScaleAndPosition();
        });

        $bookEdit.unbind('pointerdown').on('pointerdown', function (e) {
            if (e.originalType === 'mousedown') {
                e.preventDefault();
            }
            $(e.currentTarget).data('click', true);
        });

        initBookEditContextMenu();

        bindEditWrapperEvent();

        bindShortcutKey();

        bindSubBtnShowEvent();

        bindTextSlotEditEvent();
    }

    function initBookEditContextMenu() {
        //自定义右键上下文
        var bookEditEmptyMenuData = [
            [{
                text: "粘贴",
                func: function() {
                    opEvent.ePasteSlots.trigger(exports, {
                        destPageSeq: getActivePage().attr('data-seq')
                    });
                }
            }]
        ];

        $bookEdit.smartMenu(bookEditEmptyMenuData, {
            name: "bookEditEmptyMenu",
            beforeShow : function() {

            },
            afterShow : function() {

            }
        });
    }

    function bindTextSlotEditEvent() {
        $('#text-slot-input-container').on('click', '.j-save-text', function (e) {
            if (slot.text.saveAndCloseTextInputDialog())
                return;

            var el = $('#text-slot-input-container').data('el');
            $(document).scrollTop(0).triggerHandler('pointerdown.closeTextboxEditingMode');
            _selectSlot(el);
        }).on('keydown', function (e) {
            if (e.ctrlKey && e.which === 13) {
                if (slot.text.saveAndCloseTextInputDialog())
                    return;

                $(document).triggerHandler('pointerdown.closeTextboxEditingMode');
                _selectSlot($('#text-slot-input-container').data('el'));
            }
        });
    }

    function bindSubBtnShowEvent() {
        $('body').on('click', '.select_item, .select_color_item, .j-select_color_item', function(e) {
            var type = $(this).closest('[data-type]').attr('data-type');
            var value = $(this).attr('data-value');
            var subBtnId = $(this).closest('.set_property_box').attr('id');
            var opEl =  $('body').data('opEl');

            var parentBtn = $('#' + subBtnId).data('sender');
            if (parentBtn != null) {
                type = parentBtn.attr('data-type');
                if (parentBtn.is('.j-pageinfo')) {
                    opEvent.eChangePageInfo.trigger(exports, {
                        seq : getActivePageSeq(),
                        type : type,
                        value : value,
                        btnId : subBtnId
                    });
                    return;
                }
            }

            if (opEl != null) {
                opEvent.eSlotBtnOpEvent.trigger(exports, {
                    el : opEl,
                    type : type,
                    value : value,
                    btnId : subBtnId
                });
            }

            $(document).triggerHandler('pointerdown.hideSubBtn#' + subBtnId);
        }).on('click', '#showDetailColors', function(e) {
            $('#detailColorsBox').toggleClass('active')
        }).on('change', '#color_value_input', function(e) {

            var value = $(this).val();
            var reg=/^[A-Fa-f0-9]{6}$/;

            if (reg.test(value)) {
                var type = $(this).closest('[data-type]').attr('data-type');
                var subBtnId = $(this).closest('.set_property_box').attr('id');
                var opEl =  $('body').data('opEl');

                var parentBtn = $('#' + subBtnId).data('sender');
                if (parentBtn != null) {
                    type = parentBtn.attr('data-type');
                    if (parentBtn.is('.j-pageinfo')) {
                        opEvent.eChangePageInfo.trigger(exports, {
                            seq : getActivePageSeq(),
                            type : type,
                            value : "#" + value,
                            btnId : subBtnId
                        });
                    }
                }

                if (opEl != null) {
                    opEvent.eSlotBtnOpEvent.trigger(exports, {
                        el : opEl,
                        type : type,
                        value : "#" + value,
                        btnId : subBtnId
                    });
                }

                $(this).val("");

                $(document).triggerHandler('pointerdown.hideSubBtn#' + subBtnId);
            } else {
                SureMsg.error("输入有误");
            }
        });

    }

    function isBookEditStatus() {
        return ($('body').attr("data-mode") == "edit-book");
    }

    function bindEditWrapperEvent() {
        $editWrapper.on('click', '.page_nav', function (e) {
            e.preventDefault();
            view.pagelist.goto($(this).attr('data-value'));

        }).on('click', slot.getAllSlotClass(), function (e) {
            e.preventDefault();

            var multiple = e.originalEvent.ctrlKey || e.originalEvent.metaKey;

            //非编辑模式，无法选择
            if (!isBookEditStatus()) {
                return;
            }

            var sender = $(e.currentTarget);
            if (sender.data('click') === false || $bookEdit.data('click') === false) {
                return;
            }

            if (sender.attr('aria-selected') !== 'true') {
                _selectSlot(sender, multiple);
            } else {
                if (sender.hasClass('editing')) {
                    if (slot.isImageSlot(sender)) {
                        $(document).triggerHandler('pointerdown.closeImgboxEditingMode');
                        _selectSlot(sender, multiple);
                    } else if (slot.isTextSlot(sender)) {
                        $(document).triggerHandler('pointerdown.closeTextboxEditingMode');
                        _selectSlot(sender, multiple);
                    }
                } else {
                    if (slot.isImageSlot(sender)) {
                        slot.image.setImgSlotModeToEditing(sender);
                    } else if (slot.isTextSlot(sender)) {
                        slot.text.setTextSlotModeToEditing(sender, function(el, content) {
                            var pageSeq = el.parent().attr('data-seq');
                            if (pageSeq == 'front-flap' || pageSeq == 'spine') {//折页或者书脊文本框不要自动缩放
                                slot.setAttr(el, {
                                    content: content,
                                    doNotAutoSetTextboxHeight:true
                                });

                                opEvent.eTextSlotChanged.trigger(exports, {
                                    pageSeq: el.parent().attr('data-seq'),
                                    name: el.attr('data-name'),
                                    obj: {
                                        content: content
                                    }
                                });
                            } else {
                                slot.setAttr(el, {
                                    content: content
                                });

                                var textSlotHeight = sizeConverter.pxToMm(slot.text.getTextSlotTextHeight(el));

                                opEvent.eTextSlotChanged.trigger(exports, {
                                    pageSeq: el.parent().attr('data-seq'),
                                    name: el.attr('data-name'),
                                    obj: {
                                        content: content,
                                        height: textSlotHeight
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }).on('pointerdown', slot.getAllSlotClass(), function (e) {
            if (e.originalType === 'mousedown') {
                e.preventDefault();
            }

            var sender = $(e.currentTarget);
            sender.data('click', true);
        }).on('pointerdown', '.page', function (e) {
            if (e.originalType === 'mousedown') {
                e.preventDefault();
            }

            var $this = $(this), pageSeqs = $this.attr('data-seq');

            opEvent.ePageListItemSelected.trigger(exports, {
                currentPageSeqs: getCurrentPageSeqs(),
                pageSeqs: getCurrentPageSeqs(),
                selectedPageSeq: pageSeqs
            });
        }).on('click', '.edit_box_tool .edit_btn', function(e) {
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
                op.sender = $(this);

                opEvent.eSlotBtnOpEvent.trigger(exports, op);
            }
        });
    }

    function bindShortcutKey() {

        key('del', function() {
            if (isBookEditStatus()) {
                var selSlot = getSelectedSlot();
                if (selSlot.length != 0) {
                    if (slot.isImageSlot(selSlot) && !slot.isEmpty(selSlot)) {
                        removeImgSlotImg(selSlot);
                    } else {
                        opEvent.eSlotDelete.trigger(exports, {
                            el : getSelectedSlot(),
                            name : getSelectedSlot().attr('data-name'),
                            pageSeq: getActivePage().attr('data-seq')
                        });
                    }
                }
            }
            return false;
        });

        key('ctrl+z', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            opEvent.ePageUndo.trigger(exports, {
                pageSeq: getActivePage().attr('data-seq')
            });
            return false;
        });

        key('ctrl+y', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            opEvent.ePageRedo.trigger(exports, {
                pageSeq: getActivePage().attr('data-seq')
            });
            return false;
        });

        key('ctrl+s', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            opEvent.eBookSaving.trigger(exports, {
                refresh : false
            });
            return false;
        });

        key('ctrl+0', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            resetBookScaleAndPosition();
            return false;
        });

        key('ctrl+c', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            var slots = getSelectedSlotsInfo();
            opEvent.eCopySlots.trigger(exports, {
                slots: slots
            });
            return false;
        });

        key('ctrl+v', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            opEvent.ePasteSlots.trigger(exports, {
                destPageSeq: getActivePage().attr('data-seq')
            });
            return false;
        });

        key('ctrl+x', function() {
            if (!isBookEditStatus()) {
                return false;
            }

            var slots = getSelectedSlotsInfo();
            opEvent.eCutSlots.trigger(exports, {
                slots: slots
            });
            return false;
        });

        key('up, down, left, right', function(event, handler) {
            var selectedSlot = getSelectedSlot();
            if (selectedSlot.length == 0) {
                if (handler.key == "right") {
                    view.pagelist.goto("next");
                } else if (handler.key == "left") {
                    view.pagelist.goto("prev");
                }
            } else {
                if (!isBookEditStatus()) {
                    return false;
                }

                for (var i = 0; i < selectedSlot.length; i++) {
                    (function () {
                        var index = i;
                        if (selectedSlot.eq(index).length && !selectedSlot.eq(index).hasClass('editing')) {
                            if (selectedSlot.eq(index).attr('data-locked') !== 'true') {
                                var properties = slot.getAttr(selectedSlot.eq(index));
                                switch (handler.key) {
                                    case 'left': //左
                                        properties.x -= 1;
                                        break;
                                    case 'up': //上
                                        properties.y -= 1;
                                        break;
                                    case 'right': //右
                                        properties.x += 1;
                                        break;
                                    case 'down': //下
                                        properties.y += 1;
                                        break;
                                }
                                moveSlotTo(selectedSlot.eq(index), properties.x, properties.y);

                                selectedSlot.eq(index).data('selectionHandles').hide();
                                var delayClockToken = selectedSlot.eq(index).data('moveEndClockToken');
                                if (delayClockToken) {
                                    clearTimeout(delayClockToken);
                                }
                                selectedSlot.eq(index).data('moveEndClockToken', setTimeout(function () {
                                    if (selectedSlot.eq(index).attr('aria-selected') === 'true' && !selectedSlot.eq(index).hasClass('editing')) {
                                        selectedSlot.eq(index).data('selectionHandles').show();
                                    }
                                    selectedSlot.eq(index).data('moveEndClockToken', null);
                                    var properties = slot.getAttr(selectedSlot.eq(index));
                                    opEvent.eSlotChanged.trigger(exports, {
                                        pageSeq: selectedSlot.eq(index).parent().attr('data-seq'),
                                        name: selectedSlot.eq(index).attr('data-name'),
                                        el : selectedSlot.eq(index),
                                        obj: {
                                            x: sizeConverter.pxToMm(properties.x),
                                            y: sizeConverter.pxToMm(properties.y)
                                        }
                                    });
                                }, 600));
                            } else {
                                SureMsg.error("槽位已经锁定");
                            }
                        }
                    })();
                }
            }
            return false;
        });

    }

    /**
     * 放大书册到指定倍数
     * @param scale 倍数
     */
    function zoomBookTo(scale) {
        var curBookTransform = transform.getCurrent($bookEdit);

        transform.scale($bookEdit, scale);

        var deltaWidth = $bookEdit.width() * (scale - curBookTransform.scale),
            deltaHeight = $bookEdit.height() * (scale - curBookTransform.scale);

        var x = curBookTransform.translationX - deltaWidth / 2,
            y = curBookTransform.translationY - deltaHeight / 2;

        var finalXY = judgeBookXY(x, y);

        transform.translate($bookEdit, finalXY.x, finalXY.y);

        $bookEdit.attr('data-locked', false);
    }

    /**
     * 判断书册的偏移位置
     *
     * @param destX
     * @param destY
     * @returns {{x: *, y: *}}
     */
    function judgeBookXY(destX, destY) {
        var min = 100;

        if (destX > $editWrapper.width() - min) {
            destX = $editWrapper.width() - min;
        } else if (destX + $bookEdit.outerWidth() * getBookCurrentScale() < min) {
            destX = min - $bookEdit.outerWidth() * getBookCurrentScale();
        }
        if (destY > $editWrapper.height() - min) {
            destY = $editWrapper.height() - min;
        } else if (destY + $bookEdit.outerHeight() * getBookCurrentScale() < min) {
            destY = min - $bookEdit.outerHeight() * getBookCurrentScale();
        }
        return {
            x: destX,
            y: destY
        };
    }

    /**
     * 获取当前书册的缩放比例
     * @returns {Number}
     */
    function getBookCurrentScale() {
        return parseFloat($bookEdit.attr('data-scale'));
    }


    /**
     * 重置书册缩放比例和位置
     */
    function resetBookScaleAndPosition() {
        var bookWidth = parseFloat($bookEdit.css('width'));
        var bookHeight = parseFloat($bookEdit.css('height'));

        var editWidth = $editWrapper.width();
        var editHeight = $editWrapper.height();

        var scale = Math.min((editWidth - 250) / bookWidth, (editHeight - 250) / bookHeight);
        if(body.attr('data-type') == "create-tpl"){
            scale = Math.min((editWidth - 220) / bookWidth, (editHeight - 160) / bookHeight);
        }

        transform.scale($bookEdit, scale);
        _boolScaleZoombar.setCursorPosition(scale);
        transform.translate($bookEdit, (editWidth - bookWidth * scale) / 2, (editHeight - bookHeight * scale) / 2);

        $bookEdit.attr('data-locked', true);

        var selectedSlot = getSelectedSlot();
        if (selectedSlot.length != 0) {
            var selectionHandles = selectedSlot.data('selectionHandles');
            if (selectionHandles.isOn) {
                selectionHandles.resetPosition();
            }
        }
    }

    /**
     * 获取当前编辑的页面的seq值
     * @returns {Array}
     */
    function getCurrentPageSeqs() {
        var pageSeqs = [];
        $bookEdit.children('.page').each(function (i, item) {
            pageSeqs.push($(item).attr('data-seq'));
        });
        return pageSeqs;
    }

    /**
     * 设置页面属性
     *
     * @param $page 页面对象
     * @param attr  属性
     * @private
     */
    function setEditPageAttr($page, attr) {
        var seq = attr.seq, backgroundColor = attr.backgroundColor;

        if (seq !== undefined) {
            $page.attr('data-seq', seq);
        }

        if (backgroundColor !== undefined) {
            $page.attr('data-backgroundColor', backgroundColor).css('background-color', backgroundColor);
        }
    }

    /**
     * 初始化页面结构资源
     *
     * @param pageInfo      page资源
     */
    function initPageSlot(pageInfo, photos) {
        var $page = $bookEdit.children('.page[data-seq=' + pageInfo.seq + ']');
        if ($page.length == 0) {
            throw new Error("编辑页不可为空");
        }

        //页面模板名称
        $page.attr('data-name', pageInfo.name);

        setEditPageAttr($page, {
            backgroundColor: pageInfo.backgroundColor
        });

        $(document).triggerHandler('pointerdown.hide');
        //清除之前的的槽位信息
        $page.children(slot.getAllSlotClass()).remove();

        //初始化图片槽位
        var i = 0;
        for (i = 0; i  < pageInfo.imageSlotList.length; i++) {

            var imageSlot = pageInfo.imageSlotList[i];

            var photo;
            if (pageInfo.imageSlotList[i].image) {
                photo = photos[pageInfo.imageSlotList[i].image.id];
            }

            var $imgSlot = slot.create(slot.getImageSlotName(), imageSlot, photo);

            initSlotSelectAction($imgSlot);
            initSlotContextMenu($imgSlot, pageInfo.seq);
            $page.append($imgSlot);

            opEvent.eImageSlotRendered.trigger(exports, {
                pageSeq: $imgSlot.parent().attr('data-seq'),
                name: $imgSlot.attr('data-name')
            });
        }

        //初始化文本槽位
        for (i = 0; i < pageInfo.textSlotList.length; i++) {
            var textSlot = pageInfo.textSlotList[i];
            var $textSlot = slot.create(slot.getTextSlotName(), textSlot);

            initSlotSelectAction($textSlot);
            initSlotContextMenu($textSlot, pageInfo.seq);
            $page.append($textSlot);
        }

        //初始化配饰槽位
        if (pageInfo.decorationSlotList != null) {
            for (i = 0; i < pageInfo.decorationSlotList.length; i++) {
                var decorationInfo = pageInfo.decorationSlotList[i];
                var $decorationSlot = slot.create(slot.getDecorationSlotName(), decorationInfo);
                if (pageInfo.seq === 'spine') {
                    slot.setAttr($decorationSlot ,{
                        x: sizeConverter.mmToPx(decorationInfo.x),
                        y: sizeConverter.mmToPx(decorationInfo.y)
                    });
                }

                initSlotSelectAction($decorationSlot);
                initSlotContextMenu($decorationSlot, pageInfo.seq);
                $page.append($decorationSlot);
            }
        }

        //初始化底纹槽位
        if (pageInfo.shadingSlotList != null) {
            for (i = 0; i < pageInfo.shadingSlotList.length; i++) {
                var $shadingSlot = slot.create(slot.getShadingSlotName(), pageInfo.shadingSlotList[i]);
                initSlotSelectAction($shadingSlot);
                initSlotContextMenu($shadingSlot, pageInfo.seq);
                $page.append($shadingSlot);
            }
        }

        //形状
        if (pageInfo.shapeSlotList != null) {
            for (var h = 0; h < pageInfo.shapeSlotList.length; h++) {
                var $shapeSlot = slot.create(slot.getShapeSlotName(), pageInfo.shapeSlotList[h]);
                if (pageInfo.seq === 'spine') {
                    slot.setAttr($shapeSlot, {
                        x: sizeConverter.mmToPx(pageInfo.shapeSlotList[h].x),
                        y: sizeConverter.mmToPx(pageInfo.shapeSlotList[h].y)
                    });
                }
                initSlotSelectAction($shapeSlot);
                initSlotContextMenu($shapeSlot, pageInfo.seq);
                $page.append($shapeSlot);
            }
        }

    }

    function initSlotContextMenu($slot, pageSeq) {
        var name = $slot.attr('data-name');
        //自定义右键上下文
        var slotCommonMenu =
            [{
                text: "复制",
                func: function() {
                    var slots = getSelectedSlotsInfo();
                    opEvent.eCopySlots.trigger(exports, {
                        slots: slots
                    });
                }
            }, {
                text: "删除",
                func: function() {
                    var el = $(this);

                    if (slot.isImageSlot(el) && !slot.isEmpty(el)) {
                        removeImgSlotImg(el);
                    } else {
                        if (el.is('.slot')) {
                            opEvent.eSlotDelete.trigger(exports, {
                                el : el,
                                name : el.attr('data-name'),
                                pageSeq: el.attr('data-seq')
                            });
                        }
                    }
                }
            } ];

        var indexMenu = {
                    text: "层级",
                    data: [[{
                        text: "置顶",
                        func: function() {
                            setSlotZIndex(this, 'top');
                        }
                    }, {
                        text: "置底",
                        func: function() {
                            setSlotZIndex(this, 'bottom');
                        }
                    }, {
                        text: "上移",
                        func: function() {
                            setSlotZIndex(this, 'op');
                        }
                    }, {
                        text: "下移",
                        func: function() {
                            setSlotZIndex(this, 'down');
                        }
                    }]]
                };
        var imageMenuData = {
                text: "操作",
                data: [[{
                    text: "自适应",
                    func: function() {
                        opEvent.eSlotBtnOpEvent.trigger(exports, {
                            el : this,
                            type : 'adjust'
                        });
                    }
                }, {
                    text: "填充",
                    func: function() {
                        opEvent.eSlotBtnOpEvent.trigger(exports, {
                            el : this,
                            type : 'fill'
                        });
                    }
                }, {
                    text: "放大",
                    func: function() {
                        opEvent.eSlotBtnOpEvent.trigger(exports, {
                            el : this,
                            type : 'zoomin'
                        });
                    }
                }, {
                    text: "缩小",
                    func: function() {
                        opEvent.eSlotBtnOpEvent.trigger(exports, {
                            el : this,
                            type : 'zoomout'
                        });
                    }
                }]]
            };

        var slotMenuData = [slotCommonMenu, [indexMenu]];

        $slot.smartMenu(slotMenuData, {
            name: "slotMenu-" + pageSeq + name,
            beforeShow : function() {
                _selectSlot($slot, false);
                var selSlot = getSelectedSlot();

                //动态数据，及时清除
                $.smartMenu.remove();

                if (slot.isImageSlot(selSlot)) {
                    if (!slot.isEmpty(selSlot)) {
                        slotMenuData[1] = [indexMenu, imageMenuData];
                    } else {
                        slotMenuData[1] = [indexMenu];
                    }
                }
            },
            afterShow : function() {

            }
        });
    }

    /**
     * 初始槽位的选择插件
     * @param $slot
     */
    function initSlotSelectAction($slot) {
        var selectionHandles = new SelectionHandles({ element: $slot });
        selectionHandles.rotate.register(selectionHandlesRotate);
        selectionHandles.rotateEnd.register(selectionHandlesRotateEnd);
        selectionHandles.resizeStart.register(selectionHandlesResizeStart);
        selectionHandles.resize.register(selectionHandlesResize);
        selectionHandles.resizeEnd.register(selectionHandlesResizeEnd);

        $slot.data('selectionHandles', selectionHandles);
    }


    /**
     * slot旋转处理
     * 设置css属性
     *
     * @param e
     */
    function selectionHandlesRotate(e) {
        var rotation = this.getCurrentRotation();

        if (rotation > -1 && rotation < 1) {
            e.element.css('transform', transform.getCurrentTransform(e.element) +
                'translate(50%,50%)rotate(' + (-rotation) + 'deg)translate(-50%,-50%)');
        }

        showOrMoveSlotSizeTooltipAndSetContent(e.originalEvent.pageX, e.originalEvent.pageY, rotation.toFixed(1) + '°');
    }

    /**
     * slot旋转结束处理
     * 设置attr属性值
     *
     * @param e
     */
    function selectionHandlesRotateEnd(e) {
        var el = e.element;

        slot.setAttr(el, {
            rotation: e.rotation
        });

        opEvent.eSlotChanged.trigger(exports, {
            el : el,
            pageSeq: this.element.parent().attr('data-seq'),
            name: this.element.attr('data-name'),
            obj: {
                rotation: e.rotation
            }
        });

        hideSlotSizeTooltip();
    }

    /**
     * 尺寸变化开始
     * @param e
     */
    function selectionHandlesResizeStart(e) {
        var element = $(e.element);

        if (slot.isImageSlot(element) && !slot.isEmpty(element)) {
            var properties = slot.getAttr(element);
            element.data({
                resizeStartImgXY: {
                    x: properties.image.x,
                    y: properties.image.y
                },
                resizeStartWidth: properties.width,
                resizeStartHeight: properties.height
            });
        }

        refreshPageRects(element.parent());
    }

    /**
     * 尺寸变化中间
     * @param e
     */
    function selectionHandlesResize(e) {
        var element = $(e.element);

        preventSlotOut(element);

        autoAlignment(element, e.type, this.locators[e.type.split('-')[1] +
                        e.type.split('-')[2][0].toUpperCase() + e.type.split('-')[2].substring(1)]);

        if (slot.isImageSlot(element) && !slot.isEmpty(element)) {
            var resizeStartImgXY = element.data('resizeStartImgXY');

            var splites = e.type.split('-');
            var horizontal = splites[1];
            var vertical = splites[2];

            var xy = {};

            switch (horizontal) {
                case 'left':
                    xy.x = resizeStartImgXY.x + (element.width() - element.data('resizeStartWidth'));
                    break;
            }
            switch (vertical) {
                case 'top':
                    xy.y = resizeStartImgXY.y + +(element.height() - element.data('resizeStartHeight'));
                    break;
            }

            slot.setAttr(element, {
                image: xy
            });

            slot.image.preventImgOutSlot(element);
        }

        var widthMM = sizeConverter.pxToMm(element.width());
        var heightMM = sizeConverter.pxToMm(element.height());

        showOrMoveSlotSizeTooltipAndSetContent(e.originalEvent.pageX, e.originalEvent.pageY, '宽：' + widthMM.toFixed(1) + 'mm\r\n' + '高：' + heightMM.toFixed(1) + 'mm');


        if (element.hasClass('imageslot')) {
            opEvent.eImageSlotResize.trigger(exports, {
                pageSeq: element.parent().attr('data-seq'),
                name: element.attr('data-name'),
                widthMM: widthMM,
                heightMM: heightMM
            });
        }

        adjustImageSlotIconSize(element);
    }

    /**
     * 尺寸变化结束
     * @param e
     */
    function selectionHandlesResizeEnd(e) {
        var el = $(e.element);
        var properties = slot.getAttr(el);

        var obj = {};
        var xy = computeSlotXY(el);
        obj.x = sizeConverter.pxToMm(xy.x);
        obj.y = sizeConverter.pxToMm(xy.y);
        obj.width = sizeConverter.pxToMm(properties.width);
        obj.height = sizeConverter.pxToMm(properties.height);

        if (slot.isImageSlot(el)) {
            var img = el.children('.content').children('.img');
            slot.setAttr(el, xy);
            if (img.length !== 0) {
                obj.image = {
                    x: sizeConverter.pxToMm(properties.image.x),
                    y: sizeConverter.pxToMm(properties.image.y)
                };
            }

            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: obj
            });
        } else {
            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: obj
            });
        }

        clearAlignment();
        hideSlotSizeTooltip();
        adjustImageSlotIconSize(el);
    }

    /**
     * 尺寸变化中间的提示
     * @param pageX     位置x
     * @param pageY     位置y
     * @param content   提示内容
     */
    function showOrMoveSlotSizeTooltipAndSetContent(pageX, pageY, content) {
        var $tips = $('#slot_size_tooltip');
        $tips.html(content);
        var sectionEditRect = $editWrapper.data('rect');

        transform.translate($tips, pageX - sectionEditRect.left + 300, pageY - sectionEditRect.top + 70);

        if ($tips.css('display') === 'none') {
            $tips.css({
                display: 'block',
                visibility: 'hidden'
            });

            $tips.offAnimationEnd().css({
                visibility: 'visible',
                animation: 'fade-in 0.1s'
            });
        }
    }

    /**
     * 隐藏提示
     */
    function hideSlotSizeTooltip() {
        var $tips = $('#slot_size_tooltip');
        $tips.hide();
    }

    function adjustImageSlotIconSize(sender) {
        var w = sender.width(),
            h = sender.height();
        var icon = sender.children(".bg_icon");
        icon.text("");
        if (w >= h) {
            icon.css({
                "width": h / 2,
                "height": h / 2
            });
        } else {
            icon.css({
                "width": w / 2,
                "height": w / 2
            });
        }
    }

    /**
     * 移动槽位到指定位置
     * @param elSlot    槽位
     * @param destX     位置x
     * @param destY     位置y
     * @param w         宽度
     * @param h         高度
     * @param r         旋转角度
     */
    function moveSlotTo(elSlot, destX, destY, w, h, r) {
        elSlot = $(elSlot);

        slot.setAttr(elSlot, {
            x: destX,
            y: destY,
            width: w,
            height: h,
            rotation: r
        });

        preventSlotOut(elSlot);
    }

    function preventSlotOut(elSlot) {
        elSlot = $(elSlot);
        var page = elSlot.parent();

        var rectPageBody = elSlot.siblings('.locator')[0].getBoundingClientRect(),
            rectBox = elSlot[0].getBoundingClientRect(),
            centerPoint = {
                x: (rectBox.left - rectPageBody.left + (rectBox.width / 2)),
                y: (rectBox.top - rectPageBody.top + (rectBox.height / 2))
            };

        var properties = slot.getAttr(elSlot);

        var xy;
        if (centerPoint.x < 0) {
            xy = xy || computeSlotXY(elSlot);
            xy.x = -properties.width / 2;
        } else if (centerPoint.x > rectPageBody.width) {
            xy = xy || computeSlotXY(elSlot);
            xy.x = page.innerWidth() - properties.width / 2;
        }
        if (centerPoint.y < 0) {
            xy = xy || computeSlotXY(elSlot);
            xy.y = -properties.height / 2;
        } else if (centerPoint.y > rectPageBody.height) {
            xy = xy || computeSlotXY(elSlot);
            xy.y = page.innerHeight() - properties.height / 2;
        }

        if (xy) {
            slot.setAttr(elSlot, {
                x: xy.x,
                y: xy.y
            });
        }

        return xy || { x: properties.x, y: properties.y };
    }

    function computeSlotXY(elSlot) {
        elSlot = $(elSlot);

        var centerPoint = (function () {
                var rectBox = elSlot[0].getBoundingClientRect();
                var point = {};
                point.x = rectBox.left + rectBox.width / 2;
                point.y = rectBox.top + rectBox.height / 2;
                return point;
            })(),
            bookScale = getBookCurrentScale(),
            pageOffset = (function () {
                var locator = $(document.createElement('span'));
                locator.css({
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0
                });
                locator.appendTo(elSlot.parent());
                var offset = locator[0].getBoundingClientRect();
                locator.remove();
                return offset;
            })();

        var elSlotWidth = elSlot.outerWidth();
        var elSlotHeight = elSlot.outerHeight();

        var xy = {};
        xy.x = (centerPoint.x - elSlotWidth / 2 * bookScale - pageOffset.left) / bookScale;
        xy.y = (centerPoint.y - elSlotHeight / 2 * bookScale - pageOffset.top) / bookScale;

        return xy;
    }

    function setImgSlotRequireSize(pageSeq, imgSlotName, size) {
        var imgSlot = $bookEdit.children('.page[data-seq=' + pageSeq + ']').children('.imageslot[data-name=' + imgSlotName + ']');

        var width = Math.floor(size.width);
        var height = Math.floor(size.height);

        imgSlot.data({
            requireSize: {
                width: width,
                height: height
            }
        }).children('.require_size').html(width + '*' + height);
    }

    function removeImgSlotImg(el) {
        if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
            el = $bookEdit.children('.page[data-seq="' + arguments[0] + '"]').children('.imageslot[data-seq="' + arguments[1] + '"]');
        }

        el.removeAttr('data-id');

        slot.setAttr(el, {
            image: null
        });

        $(document).triggerHandler('pointerdown.closeImgboxEditingMode');
        _selectSlot(el);

        opEvent.eImageSlotChanged.trigger(exports, {
            pageSeq: el.parent().attr('data-seq'),
            name: el.attr('data-name'),
            obj: {
                image: null
            }
        });
    }

    function insertPhotoIntoImgSlot(photo, pageSeq, name, isWorkShop, isNet, callback) {
        var imgSlot = $('> .page[data-seq=' + pageSeq + '] > .imageslot[data-name=' + name + ']', $bookEdit);
        if (photo != null && photo.src) {
            imgSlot.addClass('img_loading');
            insertImgIntoSlot(photo.src, photo.id, photo.name, photo.width, photo.height, pageSeq, name, callback);
        //} else if (photo.fileWrapper) {
            //imgSlot.addClass('img_loading');
            //generateEditImgDataURL(photo, function (e) {
            //    cancelWait();
            //    insertImgIntoImgbox(e.dataURL, photo.id, photo.fileName, photo.originalSize.width, photo.originalSize.height, pageNum, imgSlotName, callback);
            //});
            //wait();
        } else {
            throw new Error('photo没有可用的数据源');
        }
    }

    function insertImgIntoSlot(src, id, fileName, width, height, pageSeq, name, callback) {
        var imgSlot =$('> .page[data-seq=' + pageSeq + '] > .imageslot[data-name=' + name + ']', $bookEdit);

        imgSlot.children('.content').children('.img').remove();
        imgSlot.removeClass('has-img').removeClass('photo_not_found');

        imgSlot.addClass('img_loading').attr('data-photoid', id);

        imgload(src, function () {
            $(this).attr({
                'data-id': id,
                'data-filename': fileName
            }).data({
                originalSize: {
                    width: this.width,
                    height: this.height
                }
            }).css({
                'transform-origin': '0 0',
                width: this.width,
                height: this.height
            });

            $(this).addClass('img').prependTo(imgSlot.children('.content'));

            imgSlot.addClass('has-img').removeClass('img_loading');

            var width;
            if (this.width / this.height > imgSlot.width() / imgSlot.height()) {
                width = imgSlot.height() * this.width / this.height;
            } else {
                width = imgSlot.width();
            }

            var result = scaleTheImgInSlot(imgSlot, width, true);

            opEvent.eImageSlotChanged.trigger(exports, {
                pageSeq: pageSeq,
                name: name,
                obj: {
                    image: {
                        id: $(this).attr('data-id'),
                        x: sizeConverter.pxToMm(result.x),
                        y: sizeConverter.pxToMm(result.y),
                        width: sizeConverter.pxToMm(result.width),
                        fileName: fileName,
                        src : src,
                        url : src,
                        rotation: 0
                    }
                }
            });

            if (typeof callback === 'function') {
                callback.call(exports);
            }
        });
    }

    function scaleTheImgInSlot(elementImgbox, width, center) {
        var img = elementImgbox.children('.content').children('.img'),
            ratio = img.height() / img.width();

        if (img.width() > img.height()) {
            if (width < 50) {
                width = 50;
            }
        } else {
            if (width * ratio < 50) {
                width = 50 / ratio;
            }
        }
        var properties = slot.getAttr(elementImgbox);

        slot.setAttr(elementImgbox, {
            image: {
                width: width
            }
        });

        var deltaWidth = width - properties.image.width,
            deltaHeight = (width - properties.image.width) * ratio;

        var x, y;
        if (center) {
            x = (properties.width - width) / 2;
            y = (properties.height - width * ratio) / 2;
        } else {
            x = properties.image.x - deltaWidth * (properties.width / 2 - properties.image.x) / properties.image.width;
            y = properties.image.y - deltaHeight * (properties.height / 2 - properties.image.y) / (properties.image.width * ratio);
        }

        slot.setAttr(elementImgbox, {
            image: {
                x: x,
                y: y
            }
        });

        var finalXY = slot.image.preventImgOutSlot(elementImgbox);

        return {
            x: finalXY.x,
            y: finalXY.y,
            width: width
        };
    }

    function selectSlot(pageSeq, name, multiple) {
        var el = $bookEdit.children('.page[data-seq=' + pageSeq + ']')
                        .children('.imageslot[data-name=' + name + '],' +
                                    '.textslot[data-name=' + name + '],' +
                                    '.decorationslot[data-name='+ name + '],' +
                                    '.shadingslot[data-name='+ name + '],' +
                                    '.shapeslot[data-name='+ name + ']');

        if (el.length === 0) {
            throw new Error('没有找到slot');
        }

        _selectSlot(el, multiple, false);
    }

    function _selectSlot(el, multiple, notShowToolbar) {
        opEvent.eSlotSelected.trigger(exports, {
            el : el,
            multiple : multiple,
            notShowToolbar : false
        });
    }

    /**
     * 刷新页面槽位的边界信息
     * @param page
     */
    function refreshPageRects(page) {
        page = $(page);

        var rectPage = page.children('.locator')[0].getBoundingClientRect();

        var rects = page.data('rects', [{
            name: 'page',
            left: rectPage.left,
            right: rectPage.right,
            top: rectPage.top,
            bottom: rectPage.bottom,
            centerX: rectPage.left + rectPage.width / 2,
            centerY: rectPage.top + rectPage.height / 2
        }]).data('rects');

        var slots = page.children(slot.getAllSlotClass());

        var i, curRect;
        for (i = 0; i < slots.length; i++) {
            curRect = slots[i].getBoundingClientRect();
            rects.push({
                name: $(slots[i]).parent().attr('data-seq') + '.' + $(slots[i]).attr('data-name'),
                left: curRect.left,
                right: curRect.right,
                top: curRect.top,
                bottom: curRect.bottom,
                centerX: curRect.left + curRect.width / 2,
                centerY: curRect.top + curRect.height / 2
            });
        }
    }

    /**
     * 自动对齐，显示对齐辅助线
     * @param elSlot    槽位
     * @param type      类型
     *              move 自动吸附
     * @param locator   定位结构
     */
    function autoAlignment(elSlot, type, locator) {
        elSlot = $(elSlot);
        locator = $(locator);

        var rectThis = locator.length > 0 ? locator[0].getBoundingClientRect() : elSlot[0].getBoundingClientRect();
        rectThis = {
            name: elSlot.parent().attr('data-seq') + '.' + elSlot.attr('data-name'),
            left: rectThis.left,
            right: rectThis.right,
            top: rectThis.top,
            bottom: rectThis.bottom,
            centerX: rectThis.left + rectThis.width / 2,
            centerY: rectThis.top + rectThis.height / 2
        };

        var i, j, k, key, key2, key3, rects, curRect;
        var page = elSlot.parent();

        var hited = { x: null, y: null };

        rects = page.data('rects');
        for (j = 0; j < rects.length; j++) {
            curRect = rects[j];

            if (curRect.name === rectThis.name) {
                continue;
            }

            for (key in rectThis) {
                for (key2 in curRect) {
                    switch (key) {
                        case 'left':
                        case 'right':
                        case 'centerX':
                            if (['left', 'right', 'centerX'].contains(key2)) {
                                var delta = rectThis[key] - curRect[key2]
                                if (Math.abs(delta) < 6) {
                                    if (!hited.x || Math.abs(delta) < Math.abs(hited.x.delta)) {
                                        hited.x = {
                                            type: key,
                                            targetType: key2,
                                            targetRect: curRect,
                                            delta: delta
                                        };
                                    }
                                }
                            } else {
                                continue;
                            }
                        case 'top':
                        case 'bottom':
                        case 'centerY':
                            if (['top', 'bottom', 'centerY'].contains(key2)) {
                                var delta = rectThis[key] - curRect[key2]
                                if (Math.abs(delta) < 6) {
                                    if (!hited.y || Math.abs(delta) < Math.abs(hited.y.delta)) {
                                        hited.y = {
                                            type: key,
                                            targetType: key2,
                                            targetRect: curRect,
                                            delta: delta
                                        };
                                    }
                                }
                            }
                    }
                }
            }
        }

        $editWrapper.children('.align_guide_line').remove();

        var bookScale = getBookCurrentScale();

        var properties = slot.getAttr(elSlot);

        //listenBoxTouchBorder(elSlot)

        var minDelta, typeSplit, obj = {};
        if (type === 'move') {
            if (hited.x) {
                obj.x = properties.x - hited.x.delta / bookScale;
            }
            if (hited.y) {
                obj.y = properties.y - hited.y.delta / bookScale;
            }
            slot.setAttr(elSlot, obj);
        } else if ((typeSplit = type.split('-'))[0] === 'resize') {
            var xType = typeSplit[1];
            var yType = typeSplit[2];
            var trans = transform.getCurrentTransform(elSlot);
            var radians = properties.rotation / 180 * Math.PI;
            var width = elSlot.width();
            var height = elSlot.height();
            if (hited.x) {
                var xDelta = hited.x.delta / bookScale;
                if (xType === 'left' && yType === 'top') {
                    obj.transform = trans += 'translateX(' + (-xDelta * Math.cos(radians)) + 'px)';
                    obj.transform = trans += 'translateY(' + (-xDelta * -Math.sin(radians)) + 'px)';
                    obj.width = width += (xDelta * Math.cos(radians));
                    obj.height = height += (xDelta * -Math.sin(radians));
                } else if (xType === 'left' && yType === 'center') {
                    obj.transform = trans += 'translateX(' + (-xDelta * Math.cos(radians)) + 'px)';
                    obj.width = width += (xDelta * Math.cos(radians));
                } else if (xType === 'left' && yType === 'bottom') {
                    obj.transform = trans += 'translateX(' + (-xDelta * Math.cos(radians)) + 'px)';
                    obj.width = width += (xDelta * Math.cos(radians));
                    obj.height = height += (-xDelta * -Math.sin(radians));
                } else if (xType === 'right' && yType === 'top') {
                    obj.transform = trans += 'translateY(' + (-xDelta * -Math.sin(radians)) + 'px)';
                    obj.width = width += (-xDelta * Math.cos(radians));
                    obj.height = height += (xDelta * -Math.sin(radians));
                } else if (xType === 'right' && yType === 'center') {
                    obj.width = width += (-xDelta * Math.cos(radians));
                } else if (xType === 'right' && yType === 'bottom') {
                    obj.width = width += (-xDelta * Math.cos(radians));
                    obj.height = height += (-xDelta * -Math.sin(radians));
                }
            }
            if (hited.y) {
                var yDelta = hited.y.delta / bookScale;
                if (xType === 'left' && yType === 'top') {
                    obj.transform = trans += 'translateX(' + (-yDelta * Math.sin(radians)) + 'px)';
                    obj.transform = trans += 'translateY(' + (-yDelta * Math.cos(radians)) + 'px)';
                    obj.width = width += (yDelta * Math.sin(radians));
                    obj.height = height += (yDelta * Math.cos(radians));
                } else if (xType === 'center' && yType === 'top') {
                    obj.transform = trans += 'translateY(' + (-yDelta * Math.cos(radians)) + 'px)';
                    obj.height = height += (yDelta * Math.cos(radians));
                } else if (xType === 'right' && yType === 'top') {
                    obj.transform = trans += 'translateY(' + (-yDelta * Math.cos(radians)) + 'px)';
                    obj.width = width += (-yDelta * Math.sin(radians));
                    obj.height = height += (yDelta * Math.cos(radians));
                } else if (xType === 'left' && yType === 'bottom') {
                    obj.transform = trans += 'translateX(' + (-yDelta * Math.sin(radians)) + 'px)';
                    obj.width = width += (yDelta * Math.sin(radians));
                    obj.height = height += (-yDelta * Math.cos(radians));
                } else if (xType === 'center' && yType === 'bottom') {
                    obj.height = height += (-yDelta * Math.cos(radians));
                } else if (xType === 'right' && yType === 'bottom') {
                    obj.width = width += (-yDelta * Math.sin(radians));
                    obj.height = height += (-yDelta * Math.cos(radians));
                }
            }
            elSlot.css(obj);
        }

        rectThis = elSlot[0].getBoundingClientRect();
        rectThis = {
            name: elSlot.parent().attr('data-seq') + '.' + elSlot.attr('data-name'),
            top: rectThis.top,
            bottom: rectThis.bottom,
            left: rectThis.left,
            right: rectThis.right,
            centerX: rectThis.left + rectThis.width / 2,
            centerY: rectThis.top + rectThis.height / 2
        };
        var rectSectionEdit = $editWrapper.data('rect');

        var lines = {
            x: {
                left: null,
                centerX: null,
                right: null
            }, y: {
                top: null,
                centerY: null,
                bottom: null
            }
        };

        var lineTop, lineBottom, lineLeft, lineRight;
        for (j = 0; j < rects.length; j++) {
            curRect = rects[j];
            if (curRect.name === rectThis.name) {
                continue;
            }

            for (key in rectThis) {
                for (key2 in curRect) {
                    switch (key) {
                        case 'left':
                        case 'right':
                        case 'centerX':
                            if (['left', 'right', 'centerX'].contains(key2)) {
                                lineTop = Math.min(curRect.top, rectThis.top);
                                lineBottom = Math.max(curRect.bottom, rectThis.bottom);
                                if (Math.abs(curRect[key2] - rectThis[key]) < 1 * bookScale) {
                                    if (!lines.x[key]) {
                                        lines.x[key] = {
                                            value: rectThis[key],
                                            top: lineTop,
                                            bottom: lineBottom,
                                            targetRect: curRect,
                                            targetType: key2
                                        };
                                    } else if (lineTop < lines.x[key].top) {
                                        lines.x[key].top = lineTop;
                                        lines.x[key].targetRect = curRect;
                                        lines.x[key].targetType = key2;
                                    } else if (lineBottom > lines.x[key].bottom) {
                                        lines.x[key].bottom = lineBottom;
                                        lines.x[key].targetRect = curRect;
                                        lines.x[key].targetType = key2;
                                    }
                                }
                            } else {
                                continue;
                            }
                        case 'top':
                        case 'bottom':
                        case 'centerY':
                            if (['top', 'bottom', 'centerY'].contains(key2)) {
                                lineLeft = Math.min(curRect.left, rectThis.left);
                                lineRight = Math.max(curRect.right, rectThis.right);
                                if (Math.abs(curRect[key2] - rectThis[key]) < 1 * bookScale) {
                                    if (!lines.y[key]) {
                                        lines.y[key] = {
                                            value: rectThis[key],
                                            left: lineLeft,
                                            right: lineRight,
                                            targetRect: curRect,
                                            targetType: key2
                                        };
                                    } else if (lineLeft < lines.y[key].left) {
                                        lines.y[key].left = lineLeft;
                                        lines.y[key].targetRect = curRect;
                                        lines.y[key].targetType = key2;
                                    } else if (lineRight > lines.y[key].right) {
                                        lines.y[key].right = lineRight;
                                        lines.y[key].targetRect = curRect;
                                        lines.y[key].targetType = key2;
                                    }
                                }
                            } else {
                                continue;
                            }
                    }
                }
            }
        }

        var line, elementLine;
        for (key in lines.x) {
            line = lines.x[key];
            if (!line) {
                continue;
            }
            elementLine = $(document.createElement('span'));
            //纯色辅助线
            elementLine.addClass('align_guide_line').css({
                position: 'absolute',
                borderLeft: '1px solid ' + (line.targetRect.name === 'page' ? '#00ffff' : line.targetType.indexOf('center') !== -1 ? '#00ffff' : '#00ffff'),
                height: (line.bottom - line.top) + 'px',
                top: (line.top - rectSectionEdit.top) + 'px',
                left: 0,
                transform: 'translateX(-50%)translateX(' + (line.value - rectSectionEdit.left) + 'px)'
            });
            //虚线辅助线
            //elementLine.addClass('align_guide_line').css({
            //    position: 'absolute',
            //    borderLeft: '1px dashed ' + (line.targetRect.name === 'page' ? '#01FF70' : line.targetType.indexOf('center') !== -1 ? '#FFDC00' : '#FF4136'),
            //    height: (line.bottom - line.top) + 'px',
            //    top: (line.top - rectSectionEdit.top) + 'px',
            //    left: 0,
            //    transform: 'translateX(-50%)translateX(' + (line.value - rectSectionEdit.left) + 'px)'
            //});
            $editWrapper.append(elementLine);
        }
        for (key in lines.y) {
            line = lines.y[key];
            if (!line) {
                continue;
            }
            elementLine = $(document.createElement('span'));
            //纯色辅助线
            elementLine.addClass('align_guide_line').css({
                position: 'absolute',
                width: (line.right - line.left) + 'px',
                borderTop: '1px solid ' + (line.targetRect.name === 'page' ? '#00ffff' : line.targetType.indexOf('center') !== -1 ? '#00ffff' : '#00ffff'),
                left: (line.left - rectSectionEdit.left) + 'px',
                top: 0,
                transform: 'translateY(-50%)translateY(' + (line.value - rectSectionEdit.top) + 'px)'
            });
            //虚线辅助线
            //elementLine.addClass('align_guide_line').css({
            //    position: 'absolute',
            //    width: (line.right - line.left) + 'px',
            //    borderTop: '1px dashed ' + (line.targetRect.name === 'page' ? '#01FF70' : line.targetType.indexOf('center') !== -1 ? '#FFDC00' : '#FF4136'),
            //    left: (line.left - rectSectionEdit.left) + 'px',
            //    top: 0,
            //    transform: 'translateY(-50%)translateY(' + (line.value - rectSectionEdit.top) + 'px)'
            //});
            $editWrapper.append(elementLine);
        }
    }

    /**
     * 清除辅助线
     */
    function clearAlignment() {
        $('.align_guide_line').remove();
    }

    function initFontOpt() {
        var fonts = fontPool.getFonts();
        var $ulFont = $('#btn-select-font-family-template ul');

        if ($ulFont.find('li').length == 0) {
            $.each(fonts, function(i, font) {
                var $liFont = $('<li class="select_item"></li>');

                $liFont.attr('data-value', font.value).css({
                    'font-family': 'font' + font.value + ',serif'
                }).text(font.name);
                $ulFont.append($liFont);
            });
        }
    }

    function clearTooltip() {
        $('.simple-tooltip').remove();
    }

    /**
     * 显示槽位的操作按钮
     * @param elSlot
     */
    function showSlotOptBtn(elSlot) {
        elSlot = $(elSlot);

        if (slot.isImageSlot(elSlot)) {
            var imgBtnTempalte;
            //图片槽位内为空
            if (slot.isEmpty(elSlot)) {
                imgBtnTempalte = $('#edit-slot-btn-template_imageslot-empty').html();
            } else {
                imgBtnTempalte = $('#edit-slot-btn-template_imageslot').html();
            }
            $slotBtnChange.empty().append(imgBtnTempalte).show();
        } else if (slot.isTextSlot(elSlot)) {
            initFontOpt();

            var textOptBtnTemplate = $('#edit-slot-btn-template_textslot').html();
            $slotBtnChange.empty().append(textOptBtnTemplate).show();
        } else if (slot.isDecorationSlot(elSlot)) {
            var decoraOptBtnTemplate = $('#edit-slot-btn-template_decorationslot').html();
            $slotBtnChange.empty().append(decoraOptBtnTemplate).show();
        } else if (slot.isShapeSlot(elSlot)) {
            var shapeOptBtnTemplate = $('#edit-slot-btn-template_shapeslot').html();
            $slotBtnChange.empty().append(shapeOptBtnTemplate).show();
        } else if (slot.isShadingSlot(elSlot)) {
            var shapeOptBtnTemplate = $('#edit-slot-btn-template_shadingslot').html();
            $slotBtnChange.empty().append(shapeOptBtnTemplate).show();
        }
        $slotBtnFixed.empty().append($('#edit-slot-btn-template_common').html()).show();

        initSlotAttrValue(elSlot, $('#pageEditMain .edit_box_tool'));

        $('body').data("opEl", elSlot);

        $('.edit_box_tool .edit_btn').simpletooltip({position: 'bottom'});
    }

    function initSlotAttrValue(el, template) {
        el = $(el);

        var attr = slot.getAttr(el);

        if (attr.locked) {
            template.find('[data-type="locked"]').attr('data-locked', true).attr('data-value', false);
        } else {
            template.find('[data-type="locked"]').attr('data-locked', false).attr('data-value', true);
        }

        if (slot.isTextSlot(el)) {

            if (attr.weight == "bold") {
                template.find('[data-type="weight"]').attr('data-select', true);
            }

            if (attr.style == "italic") {
                template.find('[data-type="style"]').attr('data-select', true);
            }

            if (attr.decoration == "underline") {
                template.find('[data-type="decoration"]').attr('data-select', true);
            }

            if (attr.align == "left") {
                template.find('[data-type="align"][data-value="left"]').attr('data-select', true);
            }
            if (attr.align == "center") {
                template.find('[data-type="align"][data-value="center"]').attr('data-select', true);
            }
            if (attr.align == "right") {
                template.find('[data-type="align"][data-value="right"]').attr('data-select', true);
            }


            template.find('[data-type="font-color"]')
                .val(attr.color)
                .attr('data-value', attr.color)
                .children('.color')
                .css({
                    'background-color' : attr.color
                });

            template.find('[data-type="font-family"]')
                .attr('data-value', attr.fontId)
                .children('span')
                .css({
                    'font-family' : "font" + attr.fontId + ",serif"
                }).text(fontPool.getFontName(attr.fontId));

            template.find('[data-type="font-size"]')
                .attr('data-value', attr.pt)
                .children('span')
                .text(attr.pt + "pt");

        } else if (slot.isImageSlot(el)) {
            template.find('[data-type="bordercolor"]')
                .val(attr.borderColor)
                .attr('data-value', attr.borderColor)
                .children('.color')
                .css({
                    'background-color' : attr.borderColor
                });
        } else if (slot.isShapeSlot(el)) {
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

    function hideSlotOptBtn() {
        $slotBtnFixed.hide();
        $slotBtnChange.hide();
    }


    function getSelectedSlot() {
        return $bookEdit.children('.page').children('.slot[aria-selected=true],.imageslot[aria-selected=true],.textslot[aria-selected=true]');
    }

    function getSelectedSlotsInfo() {
        var singleSelectSlots = getSelectedSlot();
        var selectedSlots;

        if (singleSelectSlots.length) {
            selectedSlots = singleSelectSlots;
        }

        if (selectedSlots.length === 0) {
            return;
        }

        var slots = Array.prototype.map.call(selectedSlots, function (el) {
            el = $(el);

            var pageSeq = el.parent().attr('data-seq');
            var slotName = el.attr('data-name');
            var slotType = el.attr('data-type');

            var slotInfo = {
                pageSeq: pageSeq,
                name: slotName,
                type: slotType
            };

            return slotInfo;
        });

        return slots;
    }

    function hideSelectionHandles() {
        $(document).triggerHandler('pointerdown.hideSelectionHandles');
    }

    function getActivePage() {
        return $bookEdit.children('.page.active');
    }

    function getActivePageSeq() {
        return getActivePage().attr('data-seq');
    }

    function setPageActiveByPageSeq(pageSeq) {
        setPageActive($bookEdit.children('.page[data-seq=' + pageSeq + ']'));
    }

    /**
     * 设置page为激活状态
     * @param page
     */
    function setPageActive(page) {
        page = $(page);

        var pageSeq = page.attr('data-seq');

        if (page.attr('data-type') === 'blank') {
            return;
        }

        page.addClass('active').siblings('.page').removeClass('active');

        opEvent.eSetPageActive.trigger(exports, {
            pageSeq: pageSeq,
            //templateFilter: _template.getSelectedTemplateFileter(),
            pageType: page.hasClass('left_page') ? "left" : "right"
            //isSimple: isSimple,
            //EditorStatus: EditorStatus,
            //tempHeight: tempHeight
        });
    }

    function setSlotZIndex(el, zindex) {
        el = $(el);
        var page = el.parent();
        var properties = slot.getAttr(el);
        var nowzindex = properties.index;

        //获取目前最高层级和最低层级
        var maxZIndex = 0, minZIndex = nowzindex;
        el.parent().children(slot.getAllSlotClass()).each(function (i, item) {
            var curZIndex = slot.getAttr(item).index;
            if (curZIndex > maxZIndex) {
                maxZIndex = curZIndex;
            } else if (curZIndex < minZIndex) {
                minZIndex = curZIndex;
            }
        });

        //获取目前需要设置的层级
        if (zindex === 'top') {
            zindex = maxZIndex + 1;
        } else if (zindex === 'bottom') {
            zindex = minZIndex - 1;
        } else if (zindex === 'up') {
            zindex = nowzindex + 1;
        } else if (zindex === 'down') {
            zindex = nowzindex - 1;
        }

        if (zindex > maxZIndex + 1) {
            zindex = maxZIndex + 1;
        }

        if (zindex < minZIndex - 1) {
            zindex = minZIndex - 1;
        }


        function getSlotByZindex(index) {
            return page.children('.textslot[data-index="' + i + '"],.imageslot[data-index="' + i + '"]');
        }

        var i;
        if (zindex < nowzindex) {
            for (i = zindex; i < nowzindex; i++) {
                slot.setAttr(getSlotByZindex(i), {
                    index: (i + 1)
                });
            }
        } else if (zindex > nowzindex) {
            for (i = zindex; i > nowzindex; i--) {
                slot.setAttr(getSlotByZindex(i), {
                    index: (i - 1)
                });
            }
        } else {
            return;
        }

        slot.setAttr(el, {
            index: zindex
        });

        var sortedSlots = page.children(slot.getAllSlotClass()).sort(function (a, b) {
            return slot.getAttr(a).index - slot.getAttr(b).index;
        });

        for (i = 0; i < sortedSlots.length; i++) {
            var curElementSlot = sortedSlots.eq(i);

            slot.setAttr(curElementSlot, {
                index: i
            });

            var saveToHistory = false;

            if (i === zindex) {
                saveToHistory = true;
            }

            opEvent.eSlotChanged.trigger(exports, {
                el : curElementSlot,
                pageSeq: curElementSlot.parent().attr('data-seq'),
                name: curElementSlot.attr('data-name'),
                saveToHistory: saveToHistory,
                obj: {
                    index: i
                }
            })
        }
    }

    /**
     * 渲染编辑区域页面
     *
     * @param pageInfos     页面资源
     * @param photos        照片资源
     * @param keepStyle     保持样式
     * @param activePageSeq 激活pageseq
     */
    function render(pageInfos, photos, keepStyle, activePageSeq) {
        var templatePage = $('#book_edit-template_page').html();

        var i;

        //剔除为null或undefined的页
        for (i = 0; i < pageInfos.length; i++) {
            if (!pageInfos[i]) {
                pageInfos.splice(i, 1);
            }
        }

        var pageCount = pageInfos.length;

        $(document).triggerHandler('pointerdown.hide');

        $bookEdit.children('.page').remove();
        for (i = 0; i < pageCount; i++) {
            var page = $(templatePage),
                pageInfo = pageInfos[i];

            var pageWidth = pageInfo.width;
            var pageHeight = pageInfo.height;

            page.attr({
                'data-width-mm': pageInfo.width,
                'data-height-mm': pageInfo.height,
                'data-type': pageInfo.type,
                'data-background-color': pageInfo.backgroundColor,
                'data-page': i === 0 ? 'left_page' : 'right_page'
            }).addClass(i === 0 ? 'left_page' : 'right_page').css({
                width: (sizeConverter.mmToPx(pageWidth) + 'px'),
                height: (sizeConverter.mmToPx(pageHeight) + 'px'),
                left: ($bookEdit.children('.page:last').length === 0 ? 0 : $bookEdit.children('.page:last').outerWidth())
            });

            setEditPageAttr(page, {
                seq: pageInfo.seq
            });

            $bookEdit.append(page);

            initPageSlot(pageInfo, photos);

            $bookEdit.attr('data-type', pageInfo.type);
            if (pageInfo.type == 'normal'){
                if (pageCount === 1)
                    $bookEdit.attr('data-type', 'single');

                if (pageCount === 1 && i === 1) {
                    if (pageInfo.num % 2 === 0) {
                        $bookEdit.children('.left_page').children(slot.getAllSlotClass()).remove();
                        $bookEdit.children('.right_page').attr({
                            'data-type': 'blank',
                            'data-seq': 'blank'
                        }).children(slot.getAllSlotClass()).appendTo($bookEdit.children('.left_page'));
                    } else {
                        $bookEdit.children('.left_page').attr({
                            'data-type': 'blank',
                            'data-seq': 'title_page_back'
                        }).css({
                            'background': 'white'
                        }).children(slot.getAllSlotClass()).remove();
                    }
                }
            }

            if (activePageSeq) {
                setPageActiveByPageSeq(activePageSeq);
            } else {
                setPageActive($bookEdit.children('.page:first'));
            }

            if (!keepStyle) {
                var bookWidth = (function () {
                    var widthSum = 0;
                    $bookEdit.children('.page').each(function (i, page) {
                        widthSum += $(page).outerWidth(true);
                    });
                    return widthSum;
                })();

                var bookHeight = (function () {
                    var heightMax = 0;
                    $bookEdit.children('.page').each(function (i, page) {
                        if ($(page).outerHeight() > heightMax) {
                            heightMax = $(page).outerHeight(true);
                        }
                    });
                    return heightMax;
                })();

                $bookEdit.css({
                    width: bookWidth,
                    height: bookHeight
                });

                resetBookScaleAndPosition();
            }
        }
    }

    function getPageRect(pageElement, recompute) {
        var pageRect = pageElement.data('rect');
        if (!pageRect || recompute) {
            pageElement.data('rect', pageRect = pageElement[0].getBoundingClientRect());
        }
        return pageRect;
    }

    var events = {

        //槽位操作按钮点击事件
        eSlotBtnOpEvent : new Event(),


        eInsertNewPhotoToSlot : new Event(),
        eNewImageSlotInsert : new Event(),
        eImageSlotRendered: new Event(),
        eImageSlotResize: new Event(),
        eImageSlotChanged: new Event(),
        eImageSlotImageScale: new Event(),
        eImageSlotDelete: new Event(),

        eNewDecorationSlotInsert: new Event(),

        eNewShapeSlotInsert: new Event(),
        eShapeSlotDelete: new Event(),
        eShapeSlotChanged: new Event(),

        eDecorationSlotChanged: new Event(),
        eDecorationSlotDelete: new Event(),
        eDecorationSlotImgResize: new Event(),

        eShadingSlotChanged: new Event(),

        eMewTextSlotInsert: new Event(),
        eTextSlotChanged: new Event(),
        eTextSlotDelete: new Event(),

        eSlotChanged: new Event(),
        eSlotSelected : new Event(),
        eSlotsRemove : new Event(),
        eSlotDelete : new Event(),

        eDrawPageThumbnail : new Event(),

        eChangePageInfo : new Event(),

        eCopySlots : new Event(),
        eCutSlots : new Event(),
        ePasteSlots : new Event()
    };

    function initEvent() {
        opEvent.eSlotSelected.register(function(e) {
            var el = e.el,
                multiple = e.multiple,
                notShowToolbar = e.notShowToolbar;

            el = $(el);

            var selectionHandles = el.data('selectionHandles');
            var selectedSlot = getSelectedSlot();

            if (selectedSlot.length != 0 && el[0] !== selectedSlot[0])
                hideSelectionHandles();

            if (selectionHandles.isOn) {
                selectionHandles.resetPosition();
                selectionHandles.show();
            } else {
                selectionHandles.on();
            }

            if (el.is('.slot[data-locked="true"],.page[data-seq="front-flap"] > .slot,.page[data-slot="back-flap"] > .slot')) {
                selectionHandles.hideHandles();
            }

            //显示工具栏
            if (!notShowToolbar) {
                showSlotOptBtn(el);
                view.right.showSetSlot();
            }

            if (el.attr('aria-selected') === 'true') {
                return;
            }

            el.attr('aria-selected', true);
            setPageActive(el.parent());

            $(document).on('pointerdown.hide.hideSelectionHandles', function (e) {
                if (
                    $(e.target).is('.colorpicker, .colorpicker *') ||
                    $(e.target).is('.smart_menu_box, .smart_menu_box *') ||
                    $(e.target).is('.selection-handle') ||
                    $(e.target).is('.edit_box_tool,.edit_box_tool *') ||
                    $(e.target).is('.set_property_box,.set_property_box *') ||
                    $(e.target).is('.edit_toolbar,.edit_toolbar *') ||
                    $(e.target).is($('.slot').add($('.slot *'))) ||
                    $(e.target).is('.preventHideSelectionHandles,.preventHideSelectionHandles *') ||
                    $(e.target).is('.slot_attr_wrapper,.slot_attr_wrapper *')

                ) {
                    return;
                }
                var selectedSlot = getSelectedSlot();
                selectedSlot.data('selectionHandles').off();

                //隐藏工具栏
                hideSlotOptBtn();
                view.right.showSetPageInfo();

                selectedSlot.removeAttr('aria-selected');

                $(document).off('.hideSelectionHandles');
            });
        });
    }

    exports.init = init;
    exports.bind = bindPageEvent;
    exports.events = events;

    exports.initEvent = initEvent;

    exports.render = render;
    exports.initPageSlot = initPageSlot;
    exports.setPageActive = setPageActiveByPageSeq;
    exports.getActivePage = getActivePage;
    exports.getActivePageSeq = getActivePageSeq;
    exports.getBookCurrentScale = getBookCurrentScale;
    exports.resetBookScaleAndPosition = resetBookScaleAndPosition;

    exports.getPageRect = getPageRect;
    exports.getCurrentPageSeqs = getCurrentPageSeqs;

    exports.computeSlotXY = computeSlotXY;
    exports.selectSlot = selectSlot;
    exports.getSelectedSlotsInfo = getSelectedSlotsInfo;
    exports.getSelectedSlot = getSelectedSlot;
    exports.setSlotZIndex = setSlotZIndex;

    exports.setImgSlotRequireSize = setImgSlotRequireSize;
    exports.removeImgSlotImg =removeImgSlotImg;
    exports.insertPhotoIntoImgSlot = insertPhotoIntoImgSlot;

});