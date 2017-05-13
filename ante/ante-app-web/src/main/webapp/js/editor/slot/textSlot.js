define('editor/slot/textSlot', function (require, exports, module) {

    var SizeConverter = require("common/size-converter/size-converter");
    var transform = require("common/transform/transform");
    var sizeConverter = new SizeConverter(108);

    var templateId = "#book_edit-template_textslot";
    
    var $textSlotInputContainer = $('#text-slot-input-container'),
        $textSlotInputTextarea = $('#text-slot-input-textarea');

    function template() {
        return  $(templateId).html()
    }

    function create(textSlot) {

        var $textSlot = $(template());

        var x = textSlot.x,
            y = textSlot.y;


        $textSlot.attr({
            'data-name': textSlot.name,
            'data-maxLine': textSlot.maxLine,
            'data-maxLength': textSlot.maxLength,
            'data-space': textSlot.space,
            'data-leading': textSlot.leading
        });

        setTextSlotAttr($textSlot, {
                locked: textSlot.locked !== false,
                index: textSlot.index,
                content: textSlot.content,
                pt: textSlot.pt,
                space: textSlot.space,
                leading: textSlot.leading,
                color: textSlot.color || '#000',
                fontId: textSlot.fontId,
                align: textSlot.align,
                x: sizeConverter.mmToPx(x),
                y: sizeConverter.mmToPx(y),
                width: sizeConverter.mmToPx(textSlot.width),
                height: sizeConverter.mmToPx(textSlot.height),
                rotation: textSlot.rotation || 0,
                weight : textSlot.weight,
                style : textSlot.style,
                decoration : textSlot.decoration,
                opacity : textSlot.opacity || 1,
                readonly: textSlot.readonly === true,
                doNotAutoSetTextboxHeight: true
        });

        return $textSlot;
    }

    function getTextSlotAttr(el) {
        el = $(el);

        var currentTransform = transform.getCurrent(el);

        return {
            locked: el.attr('data-locked') === 'true',
            content: el.children('.content').attr("content") ? el.children('.content').attr("content") : el.children('.content').text(),
            fontId: el.attr('data-fontId'),
            pt: parseFloat(el.attr('data-pt')),
            space: parseFloat(el.attr('data-space')),
            leading: parseFloat(el.attr('data-leading')),
            color: el.attr('data-color'),
            align: el.attr('data-align'),
            index: parseFloat(el.attr('data-index')),
            width: parseFloat(el.css('width')),
            height: parseFloat(el.css('height')),
            decoration : el.attr('data-text-decoration'),
            style : el.attr('data-font-style'),
            weight : el.attr('data-font-weight'),
            opacity : el.attr('data-opacity') || 1,
            readonly : el.attr('data-readonly'),
            maxLine : el.attr('data-maxLine'),
            maxLength : el.attr('data-maxLength'),
            x: currentTransform.translationX,
            y: currentTransform.translationY,
            rotation: currentTransform.rotation
        };
    }

    function setTextSlotAttr(el, attr) {
        el = $(el);

        var locked = attr.locked,
            index = attr.index,
            content = attr.content,
            fontId = attr.fontId,
            pt = attr.pt,
            space = attr.space,
            leading = attr.leading,
            color = attr.color,
            align = attr.align,
            width = attr.width,
            height = attr.height,
            decoration = attr.decoration,
            style = attr.style,
            weight = attr.weight,
            x = attr.x,
            y = attr.y,
            rotation = attr.rotation,
            readonly = attr.readonly,
            opacity = attr.opacity;

        if (readonly == true) {
            el.attr('data-readonly', readonly);
        }
        if (locked !== undefined) {
            el.attr('data-locked', locked);
        }
        if (index !== undefined) {
            el.attr('data-index', index).css('z-index', index);
        }
        if (content !== undefined) {
            if (content === '') {
                el.addClass('prompt');
            } else {
                el.removeClass('prompt');
            }
            el.children('.content').text(content);
        }
        if (fontId !== undefined) {
            el.attr('data-fontId', fontId).css('font-family', 'font' + fontId + ',"Microsoft YaHei","Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif');
        }
        if (pt !== undefined) {
            el.css({
                'font-size': sizeConverter.ptToPx(pt)
            }).attr('data-pt', pt);
        }
        if (space !== undefined) {
            el.css({
                'letter-spacing': ((space / 1000) + 'em')
            }).attr('data-space', space);

        }
        if (leading !== undefined) {
            el.css({
                'line-height': (leading < 0 ? '1.2em' : (sizeConverter.ptToPx(leading) + 'px'))
            }).attr('data-leading', leading);
        }
        if (color !== undefined) {
            el.attr('data-color', color).css({
                color: color
            });
        }
        if (align !== undefined) {
            el.attr('data-align', align).css({
                'text-align': align
            });
        }
        if (width !== undefined) {
            el.css('width', width);
        }
        if (height !== undefined) {
            el.css('height', height);
        }

        if (decoration !== undefined) {
            el.attr('data-text-decoration', decoration).css({
                'text-decoration' : decoration
            });
        }

        if (weight !== undefined) {
            el.attr('data-font-weight', weight).css({
                'font-weight' : weight
            });
        }

        if (style !== undefined) {
            el.attr('data-font-style', style).css({
                'font-style' : style
            });
        }

        if (x !== undefined && y !== undefined) {
            transform.translate(el, x, y);
            el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' + (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) + 'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
        } else {
            if (x !== undefined) {
                transform.translateX(el, x);
                el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' + (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) + 'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
            }
            if (y !== undefined) {
                transform.translateY(el, y);
                el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' + (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) + 'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
            }
        }
        if (rotation !== undefined) {
            transform.rotate(el, rotation);
            el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' + (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) + 'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
        }

        if (opacity !== undefined) {
            el.attr('data-opacity', opacity).css({
                'opacity' : opacity
            });
        }

        if (!attr.doNotAutoSetTextboxHeight && (content !== undefined || fontId !== undefined || pt !== undefined || space !== undefined || leading !== undefined)) {
            autoSetTextboxHeight(el);
        }
    }

    function autoSetTextboxHeight(el) {
        el = $(el);
        setTextSlotAttr(el, {
            height: getTextSlotTextHeight(el)
        });
    }

    function getTextSlotTextHeight(el) {
        el = $(el);
        var content = el.children('.content');

        var editable = $(document.createElement('div'));
        editable.css({
            'white-space': 'pre-wrap',
            'word-wrap': 'break-word',
            border: '2px solid red',
            position: 'absolute',
            width: content.width(),
            'font-family': content.css('font-family'),
            'font-size': content.css('font-size'),
            'line-height': content.css('line-height'),
            'letter-spacing': content.css('letter-spacing'),
            'text-align': content.css('text-align')
        }).attr('contenteditable', true).html(content.html() + ' ');
        editable.appendTo($('body'));
        var height = editable.outerHeight();
        editable.remove();
        return height;
    }

    function setTextSlotModeToEditing(el, callback) {
        el = $(el);

        if (!el.hasClass('editing')) {
            showTextInputFixedDialog(el, callback);

            $(document).on('pointerdown.closeTextboxEditingMode', function (e) {
                if ($(e.target).is(el.add(el.find('*')).add($('.edit_box_tool')).add($('.edit_box_tool').find('*'))
                        .add($textSlotInputContainer).add($textSlotInputContainer.find('*')))) {
                    return;
                }

                if (saveAndCloseTextInputDialog())
                    return;

                el.children('.content').trigger('blur');

                el.removeClass('editing');
                $(document).off('.closeTextboxEditingMode');
            });
            el.data('selectionHandles').hide();
            el.addClass('editing');
        }
    }

    function showTextInputFixedDialog(el, callback) {
        el = $(el);

        if (el.parent().attr('data-num') === 'spine') {
            $textSlotInputContainer.addClass('single-row');
        } else {
            $textSlotInputContainer.removeClass('single-row');
        }

        var properties = getTextSlotAttr(el);

        $textSlotInputContainer.data({
            el: el,
            initialText: properties.content,
            callback : callback
        });

        //条件不严慎
        if ($textSlotInputContainer.hasClass('single-row') && properties.content !== undefined) {
            properties.content = properties.content.replace(/[\r\n]/g, '');
        }

        $textSlotInputTextarea.val(properties.content);
        //$textSlotInputTextarea.val(properties.content).width(properties.width / 2 * ($(window).width() / 1920)).height(properties.height / 2 * ($(window).height() / 1080));

        art.dialog({
            id : 'edit-text',
            title:"编辑",
            lock:true,
            padding:0,
            content:document.querySelector('#text-slot-input-container')
        })
    }

    //显示文本输入框
    function showTextInputDialog(el, callback) {
        el = $(el);

        if (el.parent().attr('data-num') === 'spine') {
            $textSlotInputContainer.addClass('single-row');
        } else {
            $textSlotInputContainer.removeClass('single-row');
        }

        var properties = getTextSlotAttr(el);

        $textSlotInputContainer.data({
            el: el,
            initialText: properties.content,
            callback : callback
        });

        //条件不严慎
        if ($textSlotInputContainer.hasClass('single-row') && properties.content !== undefined) {
            properties.content = properties.content.replace(/[\r\n]/g, '');
        }

        $textSlotInputTextarea.val(properties.content).width(properties.width / 2 * ($(window).width() / 1920)).height(properties.height / 2 * ($(window).height() / 1080));

        var rect = el[0].getBoundingClientRect();

        $textSlotInputContainer.offAnimationEnd().css({
            display: 'block',
            animation: 'none'
        });

        var top, left;

        if (el.width() / el.height() > 3) {
            if (rect.top + rect.height / 2 < $(window).height() / 2) {
                $textSlotInputContainer.attr({
                    'data-direction': 'bottom'
                });
                top = rect.top + rect.height + 10;
                left = rect.left - ($textSlotInputContainer.outerWidth(true) - rect.width) / 2;
            } else {
                $textSlotInputContainer.attr({
                    'data-direction': 'top'
                });
                top = rect.top - $textSlotInputContainer.outerHeight(true) - 10;
                left = rect.left - ($textSlotInputContainer.outerWidth(true) - rect.width) / 2;
            }
        } else {
            if (rect.left + (rect.right - rect.left) / 2 > $(window).width() / 2) {
                $textSlotInputContainer.attr({
                    'data-direction': 'left'
                });
                top = rect.top - ($textSlotInputContainer.outerHeight() - rect.height) / 2;
                left = rect.left - $textSlotInputContainer.outerWidth() - 10;
            } else {
                $textSlotInputContainer.attr({
                    'data-direction': 'right'
                });
                top = rect.top - ($textSlotInputContainer.outerHeight() - rect.height) / 2;
                left = rect.right + 10;
            }
        }

        top += $(window).scrollTop();

        if (top < 5) {
            top = 5;
        } else if (top + $textSlotInputContainer.outerHeight() > $(window).height() - 5) {
            top = $(window).height() - $textSlotInputContainer.outerHeight() - 5;
        }
        if (left < 5) {
            left = 5;
        } else if (left + $textSlotInputContainer.outerWidth() > $(window).width() - 5) {
            left = $(window).width() - $textSlotInputContainer.outerWidth() - 5;
        }

        $textSlotInputContainer.offset({
            top: top,
            left: left
        }).oneAnimationEnd(function (e) {
            var textarea = $textSlotInputTextarea[0];
            textarea.focus();
            //#region 移动光标到末尾
            var len = textarea.value.length;
            if (document.selection) {
                var sel = textarea.createTextRange();
                sel.moveStart('character', len);
                sel.collapse();
                sel.select();
            } else if (typeof textarea.selectionStart == 'number' && typeof textarea.selectionEnd == 'number') {
                textarea.selectionStart = textarea.selectionEnd = len;
            }
            //#endregion
        }).css({
            animation: 'jump-in 0.1s'
        });
    }

    function closeTextInputDialog() {

        SureUtil.closeDialog('edit-text');

        if ($textSlotInputContainer.css('display') === 'none') {
            return;
        }
        //if (checkData.checkChineseExist()) { return true; }

        $textSlotInputContainer.oneAnimationEnd(function (e) {
            $(this).css({
                display: 'none'
            });
            $textSlotInputContainer.removeData('el');
        }).css({
            animation: 'jump-out 0.1s forwards'
        });
        $textSlotInputContainer.removeData('initialText');
        $textSlotInputContainer.removeData('callback');
        $(document).off('.hideDialogTextInput');
    }

    function saveAndCloseTextInputDialog() {
        var el = $textSlotInputContainer.data('el');

        if ($textSlotInputContainer.css('display') === 'none') {
            return;
        }

        //if (checkData.checkChineseExist()) { return true; }

        var pageSeq = el.parent().attr('data-seq'),
            name = el.attr('data-name'),
            content = $textSlotInputTextarea.val();

        if (pageSeq === undefined) {
            throw new Error('pageSeq为undefined');
        }
        if (name === undefined) {
            throw new Error('name为undefined');
        }
        if (content === undefined) {
            throw new Error('content为undefined');
        }

        //检查折页文本框是否超出高度
        //checkData.checkFlapHeight();

        if ($textSlotInputContainer.data('initialText') !== undefined &&
                content !== $textSlotInputContainer.data('initialText')) {
            var callback = $textSlotInputContainer.data('callback');
            if (typeof(callback) == 'function') {
                callback(el, content);
            }
        }

        closeTextInputDialog();
    }

    function  isLocked(el) {
        var $elSlot = $(el);
        return $elSlot.attr('data-locked') === 'true';
    }

    exports.template = template;
    exports.create = create;
    exports.getAttr = getTextSlotAttr;
    exports.setAttr = setTextSlotAttr;
    exports.isLocked = isLocked;

    exports.setTextSlotModeToEditing = setTextSlotModeToEditing;
    exports.saveAndCloseTextInputDialog = saveAndCloseTextInputDialog;
    exports.showTextInputDialog = showTextInputDialog;
    exports.closeTextInputDialog = closeTextInputDialog;

    exports.getTextSlotTextHeight = getTextSlotTextHeight;

});