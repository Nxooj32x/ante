define('editor/slot/decorationSlot', function (require, exports, module) {
    var SizeConverter = require("common/size-converter/size-converter");
    var transform = require("common/transform/transform");
    var sizeConverter = new SizeConverter(108);

    var templateId = "#book_edit-template_decorationslot";

    function template() {
        return $(templateId).html();
    }

    //出血位宽度，单位：毫米
    var bleedingWidth = 3;

    function create(decorationInfo) {

        var $decorationSlot = $(template());

        var x = decorationInfo.x,
            y = decorationInfo.y;
        if ($('body').attr('data-mode') === 'preview') {
            x -= bleedingWidth;
            y -= bleedingWidth;
        }

        $decorationSlot.attr({
            'data-name': decorationInfo.name,
            'data-id': decorationInfo.decorationId
        });

        setAttr($decorationSlot, {
            locked: decorationInfo.locked !== false,
            index: decorationInfo.index,
            x: sizeConverter.mmToPx(x),
            y: sizeConverter.mmToPx(y),
            width: (sizeConverter.mmToPx(decorationInfo.width) + 'px'),
            height: (sizeConverter.mmToPx(decorationInfo.height) + 'px'),
            rotation: decorationInfo.rotation,
            img: decorationInfo.src
        });

        return $decorationSlot;
    }

    function getAttr(el) {
        el = $(el);
        var img = el.children('.content').children('.decoration_img');
        var currentTransform = transform.getCurrent(el);

        return {
            locked: el.attr('data-locked') === 'true',
            x: currentTransform.translationX,
            y: currentTransform.translationY,
            rotation: currentTransform.rotation,
            width: parseFloat(el.css('width')),
            height: parseFloat(el.css('height')),
            index: parseFloat(el.attr('data-index')),
            borderWidth: parseFloat(el.attr('data-borderWidth')) || 0,
            borderColor: el.attr('data-borderColor') || '#ffffff',
            img: img.attr('src')
        };
    }

    function setAttr(el, attr) {
         el = $(el);

        var elementImg = el.children('.content').children('.decoration_img'),
            locked = attr.locked,
            x = attr.x,
            y = attr.y,
            width = attr.width,
            height = attr.height,
            rotation = attr.rotation,
            index = attr.index,
            image = attr.img;

        if (image !== undefined) {
            //image = "http://cdn-mimocampaign.mimoprint.com" + image.replace(/Theme/, "theme").replace(/preview/, "image") + "@!w500";
            elementImg.attr('src', image);
        }
        if (locked !== undefined) {
            el.attr('data-locked', locked);
        }
        if (width !== undefined) {
            el.css('width', width);
        }

        if (height !== undefined) {
            el.css('height', height);
        }

        if (elementImg !== undefined) {
            elementImg.css({ 'width': '100%', 'height': '100%' });
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
        if (index !== undefined) {
            el.css('z-index', index).attr('data-index', index);
        }
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