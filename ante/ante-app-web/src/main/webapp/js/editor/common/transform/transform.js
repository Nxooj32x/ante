define('common/transform/transform', function (require, exports, module) {
    /**
     * 设置缩放比例关系
     *
     * @param el    元素
     * @param scale 缩放值
     */
    function scale(el, scale) {
        el = $(el);

        var current = getCurrent(el);

        set(el, {
            scale: scale,
            rotation: current.rotation,
            translationX: current.translationX,
            translationY: current.translationY
        });
    }

    /**
     * 旋转元素
     *
     * @param el        元素
     * @param rotation  旋转角度
     */
    function rotate(el, rotation) {
        el = $(el);

        var current = getCurrent(el);

        set(el, {
            scale: current.scale,
            rotation: rotation,
            translationX: current.translationX,
            translationY: current.translationY
        });
    }

    /**
     * 设置元素偏移
     *
     * @param el    元素
     * @param x     x方向偏移
     * @param y     y方向偏移
     */
    function translate(el, x, y) {
        el = $(el);
        var current = getCurrent(el);
        set(el, {
            scale: current.scale,
            rotation: current.rotation,
            translationX: x,
            translationY: y
        });
    }

    /**
     * 设置元素x偏移
     *
     * @param el    元素
     * @param x     x方向偏移
     */
    function translateX(el, x) {
        el = $(el);

        var current = getCurrent(el);

        set(el, {
            scale: current.scale,
            rotation: current.rotation,
            translationX: x,
            translationY: current.translationY
        });
    }

    /**
     * 设置元素y偏移
     *
     * @param el    元素
     * @param y     y方向偏移
     */
    function translateY(el, y) {
        el = $(el);

        var current = getCurrent(el);

        set(el, {
            scale: current.scale,
            rotation: current.rotation,
            translationX: current.translationX,
            translationY: y
        });
    }

    /**
     * 获取当前参数值
     *
     * @param el    元素
     * @returns {{scale: (Number|number), rotation: (Number|number), translationX: (Number|number), translationY: (Number|number)}}
     */
    function getCurrent(el) {
        el = $(el);
        return {
            scale: (parseFloat(el.attr('data-scale')) || 1),
            rotation: (parseInt(el.attr('data-rotation')) || 0),
            translationX: (parseFloat(el.attr('data-translation-x')) || 0),
            translationY: (parseFloat(el.attr('data-translation-y')) || 0)
        };
    }

    /**
     * 设置元素transform属性
     *
     * @param el        元素
     * @param data      参数
     */
    function set(el, data) {
        el = $(el);
        var scale = parseFloat(data.scale).toFixed(6),
            rotation = parseFloat(data.rotation).toFixed(6),
            translationX = parseFloat(data.translationX).toFixed(6),
            translationY = parseFloat(data.translationY).toFixed(6);
        el.css({
            transform: ('translate(' + translationX + 'px,' + translationY + 'px) rotate(' + rotation + 'deg) scale(' + scale + ')')
        });

        el.attr({
            'data-scale': scale,
            'data-rotation': rotation,
            'data-translation-x': translationX,
            'data-translation-y': translationY
        });
    }

    /**
     * 清除元素 transform属性
     * @param el    元素
     */
    function clear(el) {
        el = $(el);
        el.css({
            transform: ''
        }).removeAttr('data-scale,data-rotation,data-translation-x,data-translation-y');
    }

    /**
     * 获取当前transform属性
     * @param el    元素
     * @returns {*}
     */
    function getCurrentTransform(el) {
        el = (el);

        var curTransform = el.css('transform');
        var scNums = curTransform.match(/[0-9.]+?e-[0-9]+/);
        if (scNums) {
            scNums.forEach(function (num) {
                curTransform = curTransform.replace(new RegExp(num, 'g'), parseFloat(num).toFixed(6))
            });
        }

        return curTransform;
    }

    exports.scale = scale;
    exports.rotate = rotate;
    exports.translate = translate;
    exports.translateX = translateX;
    exports.translateY = translateY;
    exports.set = set;
    exports.clear = clear;
    exports.getCurrent = getCurrent;
    exports.getCurrentTransform = getCurrentTransform;
});