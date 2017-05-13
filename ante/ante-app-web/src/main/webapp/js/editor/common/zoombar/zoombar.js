define('common/zoombar/zoombar', function (require, exports, module) {
    var Event = require('common/event/event'),
        transform = require('common/transform/transform'),
        Draggable = require('common/draggable/draggable');

    function Zoombar(el) {
        el = $(el);

        var $this = this;

        $this.elements = {
            zoombar: el,
            cursor: $('> .zoombar_cursor', el),
            buttonZoomOut: $('> .zoombar_min', el),
            buttomZoomIn: $('> .zoombar_max', el)
        };

        $this.changeStart = new Event();
        $this.change = new Event();
        $this.changeEnd = new Event();

        $this.setCursorPosition(1);

        var dragable = new Draggable($this.elements.cursor);
        dragable.dragStart.register(function (e) {
            $(e.currentTarget).data('pointerInnerX', e.pageX - $(e.currentTarget).offset().left);
            $this.changeStart.trigger($this, e);
        });
        dragable.drag.register(function (e) {
            $(e.currentTarget).addClass('no-transition');

            var left = e.pageX - $this.elements.zoombar.offset().left - $(e.currentTarget).data('pointerInnerX');

            var scale = $this.computeScaleValueFromX(left);

            $this.setCursorPosition(scale);
        });
        dragable.dragEnd.register(function (e) {
            transform.set(e.currentTarget, transform.getCurrent(e.currentTarget));
            setTimeout(function () {
                $(e.currentTarget).removeClass('no-transition');
            });
            $this.changeEnd.trigger($this);
        });

        $this.elements.zoombar.on((function () {
                var events = {};

                events.tap = function (e) {

                    var sender = $(e.currentTarget);
                    if (sender.data('isLongPress')) {
                        return;
                    }

                    var x;
                    switch (sender[0]) {
                        case $this.elements.buttonZoomOut[0]:
                            x = transform.getCurrent($this.elements.cursor).translationX - 5;
                            break;
                        case $this.elements.buttomZoomIn[0]:
                            x = transform.getCurrent($this.elements.cursor).translationX + 5;
                            break;
                        default:
                            return;
                    }

                    var scale = $this.computeScaleValueFromX(x);
                    $this.setCursorPosition(scale);

                    e.preventDefault();
                };

                events.mousedown = function (e) {

                    var sender = $(e.currentTarget);

                    var step, i = 3;
                    switch (sender[0]) {
                        case $this.elements.buttonZoomOut[0]:
                            step = function () {
                                $this.setCursorPosition($this.computeScaleValueFromX(transform.getCurrent($this.elements.cursor).translationX - i));
                            };
                            break;
                        case $this.elements.buttomZoomIn[0]:
                            step = function () {
                                $this.setCursorPosition($this.computeScaleValueFromX(transform.getCurrent($this.elements.cursor).translationX + i));
                            };
                            break;
                        default:
                            return;
                    }

                    sender.data('isLongPress', false);

                    sender.data('clockStartChangeTimeOut', setTimeout(function () {
                        sender.data('clockChangeInterval', setInterval(step, 1000 / 60));
                        $this.elements.cursor.addClass('no-transition');
                        sender.data('isLongPress', true);
                        $this.changeStart.trigger($this, e);
                    }, 200));

                    e.preventDefault();
                };

                events.mouseup = events.mouseleave = function (e) {

                    //if (checkData.checkChineseExist()) return;

                    var sender = $(e.currentTarget);
                    var clockStartChangeTimeOut = sender.data('clockStartChangeTimeOut'),
                        clockChangeInterval = sender.data('clockChangeInterval'),
                        isLongPress = sender.data('isLongPress');

                    if (clockStartChangeTimeOut) {
                        clearTimeout(clockStartChangeTimeOut);
                    }
                    if (clockChangeInterval) {
                        clearInterval(clockChangeInterval);
                    }

                    if (!isLongPress) {
                        return;
                    }

                    $this.elements.cursor.removeClass('no-transition');

                    $this.changeEnd.trigger($this);

                    e.preventDefault();
                };

                return events;
            })(), '.zoombar_btn').on('pointerdown', function (e) {

                if ($(e.target).is('.zoombar_btn')) {
                    return;
                }

                var left = e.pageX - $this.elements.zoombar.offset().left - $this.elements.cursor.outerWidth() / 2;

                var scale = $this.computeScaleValueFromX(left);

                $this.setCursorPosition(scale);
                e.preventDefault();
            });
    }

    Zoombar.prototype.getMaxValue = function () {
        return parseFloat(this.elements.zoombar.attr('data-max-value'));
    };

    Zoombar.prototype.getMinValue = function () {
        return parseFloat(this.elements.zoombar.attr('data-min-value'));
    };

    Zoombar.prototype.setCursorPosition = function (scaleValue) {
        var $this = this,
            maxValue = this.getMaxValue(),
            minValue = this.getMinValue();

        if (scaleValue < minValue) {
            scaleValue = minValue;
        } else if (scaleValue > maxValue) {
            scaleValue = maxValue;
        }


        var left = (scaleValue - minValue) / (maxValue - minValue) * (($this.elements.zoombar.width() -
            $this.elements.buttonZoomOut.outerWidth() - $this.elements.cursor.outerWidth()) -
            ($this.elements.buttomZoomIn.outerWidth())) + $this.elements.buttonZoomOut.outerWidth();

        transform.translate($this.elements.cursor, left, 0);

        var percent = parseInt(parseFloat(scaleValue).toFixed(2)*100) +'%';
        if(percent == "100%"){
            percent = "1:1";
        }
        $this.elements.cursor.attr('data-text',percent);
        $this.elements.zoombar.attr('data-text',percent);

        $this.change.trigger($this, {
            scale: scaleValue
        });
    };

    Zoombar.prototype.computeScaleValueFromX = function (x) {
        var $this = this,
            maxValue = $this.getMaxValue(),
            minValue = $this.getMinValue();

        var scaleValue = (x - $this.elements.buttonZoomOut.outerWidth()) / (($this.elements.zoombar.width() -
            $this.elements.buttonZoomOut.outerWidth() - $this.elements.cursor.outerWidth()) - ($this.elements.buttomZoomIn.outerWidth())) *
            (maxValue - minValue) + minValue;
        return scaleValue;
    };

    module.exports = Zoombar;
});