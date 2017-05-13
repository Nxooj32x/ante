define('editor/slot/shapeSlot', function (require, exports, module) {
    var SizeConverter = require("common/size-converter/size-converter");
    var transform = require("common/transform/transform");
    var sizeConverter = new SizeConverter(108);

    var templateId = '#book_edit-template_shapeslot';

    //出血位宽度，单位：毫米
    var bleedingWidth = 3;

    function template() {
        return $(templateId).html();
    }

    function create(shapeInfo) {

        var $shapeSlot = $(template());

        var x = shapeInfo.x,
            y = shapeInfo.y;
        if ($('body').attr('data-mode') === 'preview') {
            x -= bleedingWidth;
            y -= bleedingWidth;
        }

        $shapeSlot.attr({
            'data-name': shapeInfo.name,
            'data-decorationId': shapeInfo.decorationId
        });

        setAttr($shapeSlot, {
            locked: shapeInfo.locked !== false,
            index: shapeInfo.index,
            x: sizeConverter.mmToPx(x),
            y: sizeConverter.mmToPx(y),
            width: (sizeConverter.mmToPx(shapeInfo.width) + 'px'),
            height: (sizeConverter.mmToPx(shapeInfo.height) + 'px'),
            rotation: shapeInfo.rotation,
            opacity: shapeInfo.opacity,
            color: shapeInfo.color,
            borderColor: shapeInfo.borderColor,
            borderWidth: shapeInfo.borderWidth
        });

        return $shapeSlot;
    }

    function setAttr(el, attr) {
         el = $(el);

        var locked = attr.locked,
            x = attr.x,
            y = attr.y,
            width = attr.width,
            height = attr.height,
            rotation = attr.rotation,
            index = attr.index,
            borderColor = attr.borderColor,
            borderWidth = attr.borderWidth,
            color = attr.color,
            opacity = attr.opacity;

        if (locked !== undefined) {
            el.attr('data-locked', locked);
        }
        if (width !== undefined) {
            el.css('width', width);
        }

        if (height !== undefined) {
            el.css('height', height);
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
        if (borderColor !== undefined) {
            el.css('border-color', borderColor).attr('data-borderColor', borderColor);
        }
        if (borderWidth !== undefined) {
            el.css('border-width', borderWidth).attr('data-borderWidth', borderWidth);
        }
        if (color !== undefined) {
            el.css('background-color', color).attr('data-color', color);
        }
        if (opacity !== undefined) {
            el.css('opacity', opacity).attr('data-opacity', opacity);
        }
    }

    function getAttr(el) {
        el = $(el);

        var currentTransform = transform.getCurrent(el);

        return {
            locked: el.attr('data-locked') === 'true',
            x: currentTransform.translationX,
            y: currentTransform.translationY,
            rotation: currentTransform.rotation,
            width: parseFloat(el.css('width')),
            height: parseFloat(el.css('height')),
            index: parseFloat(el.attr('data-index')),
            borderColor: (el.attr('data-borderColor')) || '#ffffff',
            borderWidth: parseFloat(el.attr('data-borderWidth')) || 0,
            opacity: (el.attr('data-opacity')),
            color: (el.attr('data-color'))
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