define('common/draggable/draggable', function (require, exports, module) {
    var Event = require('common/event/event');

    var dragId = 0;

    /**
     * 拖动组件
     *
     * @param el        拖动的元素外围
     * @param selector  拖动的元素选择器
     * @param delta     触发事件位移。设置越大 触发频率越低
     * @param longtouchtime     长触发检测时间
     * @param preventDefault    禁止默认行为
     * @constructor
     */
    function Draggable(el, selector, delta, longtouchtime, preventDefault) {
        if (arguments[0] instanceof jQuery || typeof arguments[0] === 'string') {
            el = $(el);
            delta = delta || 1;
            longtouchtime = longtouchtime || 0;
            preventDefault = preventDefault === undefined ? true : preventDefault;
        } else {
            el = $(arguments[0].el);
            selector = arguments[0].selector;
            delta = arguments[0].delta || 1;
            longtouchtime = arguments[0].longtouchtime || 0;
            preventDefault = arguments[0].preventDefault === undefined ? true : arguments[0].preventDefault;
        }

        var $this = this,
            isTouchDevice = checkIsTouchDevice();

        $this.element = el;

        $this.dragStart = new Event();
        $this.drag = new Event();
        $this.dragEnd = new Event();

        $this.delta = delta;
        $this.isOn = false;
        $this.state = 0; //0为Normal状态，1为MouseDown，2为MouseMove

        $this.dragStartPoint = null;

        // 屏蔽浏览器原生dragstart事件
        el.on('dragstart', function (e) {
            if (!$this.isOn) {
                return;
            }
            e.preventDefault();
        });

        el.on((isTouchDevice ? 'touchstart' : 'mousedown') + '.drag', selector, function (e) {
            if (!$this.isOn)
                return;

            if (e.type === 'mousedown' && e.button !== 0)
                return;

            e.pageX = e.pageX || e.originalEvent.touches[0].pageX;
            e.pageY = e.pageY || e.originalEvent.touches[0].pageY;

            if (e.type === "mousedown" || preventDefault) {
                e.preventDefault();
            }

            var currentTarget = e.currentTarget,
                target = e.target;

            var frameToken; // requestAnimationFrameToken

            $this.state = 1;
            $this.dragStartPoint = {x: e.pageX, y: e.pageY};

            var eventId = dragId++;

            var offDrag = function (e) {
                if (e.type === "mouseup")
                    e.preventDefault();

                if (e.pageX === undefined)
                    e.pageX = $this.lastDragX;
                if (e.pageY === undefined)
                    e.pageY = $this.lastDragY;

                window.requestAnimationFrame(function () {
                    if ($this.state === 2) {
                        $this.dragEnd.trigger($this, {
                            currentTarget: currentTarget,
                            target: target,
                            startPoint: $this.dragStartPoint,
                            pageX: e.pageX || e.originalEvent.changedTouches[0].pageX,
                            pageY: e.pageY || e.originalEvent.changedTouches[0].pageY,
                            deltaX: ((e.pageX || e.originalEvent.changedTouches[0].pageX) - $this.dragStartPoint.x),
                            deltaY: ((e.pageY || e.originalEvent.changedTouches[0].pageY) - $this.dragStartPoint.y),
                            event: e
                        });
                    }
                    $(document).off('.drag' + eventId);
                    $(window).off('.drag' + eventId);

                    $this.state = 0;
                });
            };

            var triggerDragstart = function (e) {
                $this.state = 2;
                $this.dragStart.trigger($this, {
                    currentTarget: currentTarget,
                    target: target,
                    startPoint: $this.dragStartPoint,
                    pageX: e.pageX,
                    pageY: e.pageY,
                    deltaX: e.pageX - $this.dragStartPoint.x,
                    deltaY: e.pageY - $this.dragStartPoint.y,
                    event: e, //原始事件对象
                    prevent: function () {
                        $(document).off('.drag' + eventId);
                        $(window).off('.drag' + eventId);
                        $this.state = 0;
                    }
                });
            };

            var bindDragEvent = function () {
                $(document).on(isTouchDevice ? ('touchmove.drag' + eventId) : ('mousemove.drag' + eventId), function (e) {
                    if (preventDefault) {
                        e.preventDefault();
                    }

                    e.pageX = e.pageX || e.originalEvent.touches[0].pageX;
                    e.pageY = e.pageY || e.originalEvent.touches[0].pageY;

                    if ($this.dragStartPoint.x === e.pageX && $this.dragStartPoint.y === e.pageY) {
                        return;
                    }

                    switch ($this.state) {
                        case 1:
                        case 2:
                            if ($this.state === 1) {
                                if (Math.abs(e.pageX - $this.dragStartPoint.x) >= $this.delta ||
                                    Math.abs(e.pageY - $this.dragStartPoint.y) >= $this.delta) {
                                    triggerDragstart(e);
                                }
                            }
                            window.cancelAnimationFrame(frameToken);
                            frameToken = window.requestAnimationFrame(function () {
                                if ($this.state === 2) {
                                    $this.drag.trigger($this, {
                                        currentTarget: currentTarget,
                                        target: target,
                                        startPoint: $this.dragStartPoint,
                                        pageX: e.pageX,
                                        pageY: e.pageY,
                                        deltaX: e.pageX - $this.dragStartPoint.x,
                                        deltaY: e.pageY - $this.dragStartPoint.y,
                                        event: e,
                                        prevent: function () {
                                            $(document).off('.drag' + eventId);
                                            $(window).off('.drag' + eventId);
                                            $this.state = 0;
                                        }
                                    });
                                    $this.lastDragX = e.pageX;
                                    $this.lastDragY = e.pageY;
                                }
                            });
                            break;
                    }
                }).on(isTouchDevice ? ('touchend.drag' + eventId) : ('mouseup.drag' + eventId), offDrag);
                $(window).on('blur.drag' + eventId, offDrag);
            };

            if (longtouchtime > 0) {
                var bindDragEventClockToken = setTimeout(function () {
                    $(document).off('.checkmove');
                    triggerDragstart(e);
                    bindDragEvent();
                }, longtouchtime);
                $(document).on('touchmove.checkmove touchend.checkmove touchcancel.checkmove mousemove.checkmove mouseup.checkmove', function (e) {
                    if ((e.type === 'touchmove' || e.type === 'mousemove')
                        && e.pageX === $this.dragStartPoint.x && e.pageY === $this.dragStartPoint.y)
                        return;
                    clearTimeout(bindDragEventClockToken);
                    $(document).off('.checkmove');
                });
            } else {
                bindDragEvent();
            }
        });

        $this.on();
    }

    Draggable.prototype.on = function () {
        this.isOn = true;
    };

    Draggable.prototype.off = function () {
        this.isOn = false;
    };

    function checkIsTouchDevice() {
        return window.navigator.userAgent.indexOf('iPad') !== -1;
    }

    module.exports = Draggable;
});