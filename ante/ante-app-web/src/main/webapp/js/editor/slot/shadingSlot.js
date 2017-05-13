define('editor/slot/shadingSlot', function (require, exports, module) {
    var SizeConverter = require("common/size-converter/size-converter");
    var transform = require("common/transform/transform");
    var sizeConverter = new SizeConverter(108);

    var templateId = '#book_edit-template_shadingslot';

    //出血位宽度，单位：毫米
    var bleedingWidth = 3;

    function template() {
        return $(templateId).html();
    }

    function create(shadingInfo) {
        var $shadingSlot = $(template());

        var x = shadingInfo.x;
        var y = shadingInfo.y;

        if ($('body').attr('data-mode') === 'preview' &&
                $('#section_book_edit').children('.page').attr('data-seq') != 'front-flap') {
            x -= bleedingWidth;
            y -= bleedingWidth;
        }

        $shadingSlot.attr({
            'data-name': shadingInfo.name,
            'data-slotId': shadingInfo.slotId
        });

        setAttr($shadingSlot, {
            shadingId: shadingInfo.shadingId,
            thumbUrl: shadingInfo.thumbUrl,
            editUrl: shadingInfo.editUrl,
            locked: shadingInfo.locked !== false,
            index: shadingInfo.index,
            x: sizeConverter.mmToPx(x),
            y: sizeConverter.mmToPx(y),
            width: (sizeConverter.mmToPx(shadingInfo.width) + 'px'),
            height: (sizeConverter.mmToPx(shadingInfo.height) + 'px'),
            rotation: shadingInfo.rotation,
            imgWidth: sizeConverter.mmToPx(shadingInfo.imgWidth)
        });

        return $shadingSlot;
    }

    function setAttr(el, attr) {
        el = $(el);

        var shadingId = attr.shadingId;
        var thumbUrl = attr.thumbUrl;
        var editUrl = attr.editUrl;
        var locked = attr.locked;
        var index = attr.index;
        var width = attr.width;
        var height = attr.height;
        var x = attr.x;
        var y = attr.y;
        var rotation = attr.rotation;
        var imgWidth = attr.imgWidth;

        if (shadingId !== undefined) {
            el.attr('data-shadingId', shadingId);
        }
        if (editUrl !== undefined) {
            //editUrl = 'http://cdn-mimocampaign.mimoprint.com' + editUrl.replace(/Theme/, "theme").replace(/preview/, "image") + '@!w500';
            el.attr('data-edit-url', editUrl).children('.content').children('.img').attr('src', editUrl);
        }
        if (imgWidth !== undefined) {
            el.attr('data-img-width', imgWidth).children('.content').children('.img').css({
                width: imgWidth
            });
        }

        if (locked !== undefined) {
            el.attr('data-locked', locked);
        }

        if (index !== undefined) {
            el.attr('data-index', index).css('z-index', index);
        }

        if (width !== undefined) {
            el.css('width', width);
        }

        if (height !== undefined) {
            el.css('height', height);
        }

        if (x !== undefined && y !== undefined) {
            transform.translate(el, x, y);
            el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' +
                (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) +
                'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
        } else {
            if (x !== undefined) {
                transform.translateX(el, x);
                el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' +
                    (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) +
                    'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
            }
            if (y !== undefined) {
                transform.translateY(el, y);
                el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' +
                    (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) +
                    'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
            }
        }

        if (rotation !== undefined) {
            transform.rotate(el, rotation);
            el.css('transform', 'translate(' + (el.outerWidth() / 2) + 'px,' +
                (el.outerHeight() / 2) + 'px)' + transform.getCurrentTransform(el) +
                'translate(' + (-el.outerWidth() / 2) + 'px,' + (-el.outerHeight() / 2) + 'px)');
        }
    }

    function getAttr(el) {
        el = $(el);
        var currentTransform = transform.getCurrent(el);
        return {
            shadingId: el.attr('data-shadingId'),
            locked: el.attr('data-locked') === 'true',
            index: parseFloat(el.attr('data-index')),
            width: parseFloat(el.css('width')),
            height: parseFloat(el.css('height')),
            x: currentTransform.translationX,
            y: currentTransform.translationY,
            rotation: currentTransform.rotation,
            editUrl: el.attr('data-edit-url'),
            imgWidth: parseFloat(el.attr('data-img-width'))
        };
    }

    function  isLocked(el) {
        var $elSlot = $(el);
        return $elSlot.attr('data-locked') === 'true';
    }

    exports.template = template;
    exports.create = create;
    exports.getAttr = getAttr;
    exports.setAttr = setAttr;
    exports.isLocked = isLocked;
});