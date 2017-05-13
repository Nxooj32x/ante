define('common/selection-handles/selection-handles', function (require, exports, module) {
    var Draggable = require('common/draggable/draggable'),
        Event = require('common/event/event'),
        more_selection = require('common/align/more_selection');

    function SelectionHandles(args) {
        var htmlElement = $(args.element),
            setCss = args.setCss === undefined ? true : args.setCss,
            minWidth = args.minWidth || 10,
            minHeight = args.minHeight || 10;

        this.element = htmlElement;
        this.setCss = setCss;
        this.minWidth = minWidth;
        this.minHeight = minHeight;
        this.isOn = false;

        this.element.css('transform-origin', '0 0');

        this.rotateStart = new Event();
        this.rotate = new Event();
        this.rotateEnd = new Event();
        this.resizeStart = new Event();
        this.resize = new Event();
        this.resizeEnd = new Event();

        this.locators = {};
        this.handles = {};
        this.borders = {};
    }

    var shiftKey;
    (function () {
        $("body").on("mousedown", function (e) {
            var e = e || window.event;
            shiftKey = !!e.shiftKey;
        });
    })();

    SelectionHandles.prototype.on = function () {
        var $this = this;
        this.element.addClass('transformable-box');
        for (i = 0; i < 5; i++) {//添加图片边框
            var border = $(document.createElement('span'));
            border.addClass('selection-border');

            switch (i) {
                case 0:
                    border.addClass('selection-border-top');
                    $this.borders.top = border;
                    break;
                case 1:
                    border.addClass('selection-border-right');
                    $this.borders.right = border;
                    break;
                case 2:
                    border.addClass('selection-border-bottom');
                    $this.borders.bottom = border;
                    break;
                case 3:
                    border.addClass('selection-border-left');
                    $this.borders.left = border;
                    break;
                case 4:
                    border.addClass('selection-border-linkrotate');
                    $this.borders.linkrotate = border;
                    break;
            }

            border.appendTo($('body'));
        }

        for (var i = 0; i < 9; i++) {
            var handle = $(document.createElement('span')),
                locator = $(document.createElement('span'));
            handle.addClass('selection-handle');
            locator.addClass('selection-handle-locator');

            if (i < 8) {
                handle.addClass('selection-handle-resize');
                switch (i) {
                    case 0:
                        handle.addClass('selection-handle-resize-left-top');
                        locator.addClass('selection-handle-locator-left-top');
                        this.handles.leftTop = handle;
                        this.locators.leftTop = locator;
                        break;
                    case 1:
                        handle.addClass('selection-handle-resize-left-bottom');
                        locator.addClass('selection-handle-locator-left-bottom');
                        this.handles.leftBottom = handle;
                        this.locators.leftBottom = locator;
                        break;
                    case 2:
                        handle.addClass('selection-handle-resize-right-top');
                        locator.addClass('selection-handle-locator-right-top');
                        this.handles.rightTop = handle;
                        this.locators.rightTop = locator;
                        break;
                    case 3:
                        handle.addClass('selection-handle-resize-right-bottom');
                        locator.addClass('selection-handle-locator-right-bottom');
                        this.handles.rightBottom = handle;
                        this.locators.rightBottom = locator;
                        break;
                    case 4:
                        handle.addClass('selection-handle-resize-center-top');
                        locator.addClass('selection-handle-locator-center-top');
                        this.handles.centerTop = handle;
                        this.locators.centerTop = locator;
                        break;
                    case 5:
                        handle.addClass('selection-handle-resize-center-bottom');
                        locator.addClass('selection-handle-locator-center-bottom');
                        this.handles.centerBottom = handle;
                        this.locators.centerBottom = locator;
                        break;
                    case 6:
                        handle.addClass('selection-handle-resize-left-center');
                        locator.addClass('selection-handle-locator-left-center');
                        this.handles.leftCenter = handle;
                        this.locators.leftCenter = locator;
                        break;
                    case 7:
                        handle.addClass('selection-handle-resize-right-center');
                        locator.addClass('selection-handle-locator-right-center');
                        this.handles.rightCenter = handle;
                        this.locators.rightCenter = locator;
                        break;
                }
            } else {
                handle.addClass('selection-handle-rotate');
                this.handles.rotate = handle;
                locator.addClass('selection-handle-locator-center');
                this.locators.center = locator;
            }

            locator.appendTo(this.element);
            handle.appendTo($('body'));
        }

        this.resetPosition();

        var handles;
        for (var key in $this.handles) {
            if (handles) {
                handles = handles.add($this.handles[key]);
            } else {
                handles = $this.handles[key];
            }
        }
        $(handles).on({
            mouseenter: function (e) {
                if (!$($this).data('drag')) {
                    if ($(this).hasClass('selection-handle-resize')) {
                        $this.setCursorToResize(this);
                    } else if ($(this).hasClass('selection-handle-rotate')) {
                        $this.setCursorToRotate();
                    }
                }
            },
            mouseleave: function () {
                if (!$($this).data('drag')) {
                    $this.setCursorToDefault();
                }
            }
        });
        var draggable = new Draggable(handles);
        draggable.dragStart.register(function (e) {
            var currentTarget = $(e.currentTarget);

            $($this).data('drag', true);

            var offsetLeftTop = $this.locators.leftTop.offset(),
                offsetLeftBottom = $this.locators.leftBottom.offset(),
                offsetRightTop = $this.locators.rightTop.offset(),
                offsetRightBottom = $this.locators.rightBottom.offset();

            $this.elementInitialTransform = $this.element.css('transform');
            $this.centerPoint = {
                x: (offsetRightBottom.left - (offsetRightBottom.left - offsetLeftTop.left) / 2),
                y: (offsetRightBottom.top - (offsetRightBottom.top - offsetLeftTop.top) / 2)
            };

            $this.radiansStartMouse = $this.computePointRadians(e.startPoint.x, e.startPoint.y);
            $this.radiansStart = $this.getCurrentRadians();

            $this.initialSize = {
                width: $this.element.innerWidth(),
                height: $this.element.innerHeight()
            };

            $this.offsetLeftTop = $this.locators.leftTop.offset();
            $this.offsetLeftBottom = $this.locators.leftBottom.offset();
            $this.offsetRightTop = $this.locators.rightTop.offset();
            $this.offsetRightBottom = $this.locators.rightBottom.offset();
            $this.offsetCenter = $this.locators.center.offset();

            $this.locations = $this.getLocations();

            var x = $this.offsetRightTop.left - $this.offsetLeftTop.left + 1,
                y = $this.offsetRightTop.top - $this.offsetLeftTop.top + 1;
            $this.scale = Math.sqrt(x * x + y * y) / $this.element.innerWidth();

            if (currentTarget.is('.selection-handle-rotate')) {
                $this.setCursorToRotate();
                $this.rotateStart.trigger($this, {
                    type: 'rotate',
                    element: $this.element,
                    originalEvent: e
                });
            } else {
                var type;
                if (currentTarget.is('.selection-handle-resize-left-top')) {
                    type = 'resize-left-top';
                } else if (currentTarget.is('.selection-handle-resize-left-bottom')) {
                    type = 'resize-left-bottom';
                } else if (currentTarget.is('.selection-handle-resize-right-top')) {
                    type = 'resize-right-top';
                } else if (currentTarget.is('.selection-handle-resize-right-bottom')) {
                    type = 'resize-right-bottom';
                }
                $this.setCursorToResize(currentTarget);
                $this.resizeStart.trigger($this, {
                    type: type,
                    element: $this.element,
                    originalEvent: e
                });
            }
        });
        draggable.drag.register(function (e) {
            var currentTarget = $(e.currentTarget);

            var radiansCurrent, radiansMouse, radians;
            var isDecora = $this.element.hasClass('decorationslot');
            if (currentTarget.hasClass('selection-handle-rotate')) {
                radiansMouse = $this.computePointRadians(e.pageX, e.pageY);
                radians = radiansMouse - $this.radiansStartMouse;
                var rotatedAngle = radians / Math.PI * 180;
                $this.rotatedAngle = rotatedAngle;
                if ($this.setCss) {
                    $this.element.css('transform', $this.elementInitialTransform + 'translate(50%,50%)' + 'rotate(' + rotatedAngle + 'deg)' + 'translate(-50%,-50%)');
                }

                $this.rotate.trigger($this, {
                    type: 'rotate',
                    element: $this.element,
                    rotatedAngle: rotatedAngle,
                    rotationMouse: (radiansMouse / Math.PI * 180),
                    originalEvent: e
                });
            } else if (currentTarget.hasClass('selection-handle-resize')) {
                var x, y, len, height, width, top, left, eventObj = {
                    element: $this.element,
                    initialSize: $this.initialSize,
                    originalEvent: e
                };

                if (currentTarget.hasClass('selection-handle-resize-center-top')) {
                    x = e.pageX - $this.offsetLeftBottom.left;
                    y = $this.offsetLeftBottom.top - e.pageY;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = Math.acos(y / len);
                    if (e.pageX < $this.offsetLeftBottom.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;


                    height = Math.round(len * Math.cos(radians) / $this.scale);


                    if (height < $this.minHeight / $this.scale) {
                        height = $this.minHeight / $this.scale;
                    }

                    top = $this.deltaTop = -(height - $this.initialSize.height);

                    //挂件等比缩放
                    if (isDecora && window.EditorStatus != 1) {

                        width = ($this.initialSize.width * height) / $this.initialSize.height;

                        if (width < $this.minWidth / $this.scale) {
                            width = $this.minWidth / $this.scale;
                        }
                    }
                    if (isDecora && window.EditorStatus != 1) {
                        if ($this.setCss) {
                            $this.element.css({
                                transform: ($this.elementInitialTransform + 'translateY(' + top + 'px)')
                            }).innerWidth(width).innerHeight(height);
                        }
                    } else {
                        if ($this.setCss) {
                            $this.element.css({
                                transform: ($this.elementInitialTransform + 'translateY(' + top + 'px)')
                            }).innerHeight(height);
                        }
                    }

                    eventObj.type = 'resize-center-top';
                    eventObj.height = height;
                    eventObj.deltaTop = top;

                } else if (currentTarget.hasClass('selection-handle-resize-center-bottom')) {
                    x = e.pageX - $this.offsetLeftTop.left;
                    y = $this.offsetLeftTop.top - e.pageY;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = Math.acos(y / len);
                    if (e.pageX < $this.offsetLeftTop.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    height = -Math.round(len * Math.cos(radians) / $this.scale);


                    //挂件等比缩放new Add Code7.14
                    if (isDecora && window.EditorStatus != 1) {

                        width = ($this.initialSize.width * height) / $this.initialSize.height;

                    }
                    if (isDecora && window.EditorStatus != 1) {
                        if (width < $this.minWidth / $this.scale) {
                            width = $this.minWidth / $this.scale;
                        }
                        if (height < $this.minHeight / $this.scale) {
                            height = $this.minHeight / $this.scale;
                        }
                        if ($this.setCss) {
                            $this.element.css({
                                transform: $this.elementInitialTransform
                            }).innerWidth(width).innerHeight(height);
                        }
                    } else {
                        if (height < $this.minHeight / $this.scale) {
                            height = $this.minHeight / $this.scale;
                        }
                        if ($this.setCss) {
                            $this.element.css({
                                transform: $this.elementInitialTransform
                            }).innerHeight(height);
                        }

                    }

                    eventObj.type = 'resize-center-bottom';
                    eventObj.height = height;

                } else if (currentTarget.hasClass('selection-handle-resize-left-center')) {
                    x = e.pageX - $this.offsetRightBottom.left;
                    y = e.pageY - $this.offsetRightBottom.top;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = -Math.acos(y / len);
                    if (e.pageX < $this.offsetRightBottom.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    width = Math.round(len * Math.sin(radians) / $this.scale);

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }


                    left = $this.deltaLeft = -(width - $this.initialSize.width);

                    //挂件等比缩放7.14
                    if (isDecora && window.EditorStatus != 1) {
                        height = ($this.initialSize.height * width) / $this.initialSize.width;
                        if (height < $this.minHeight / $this.scale) {
                            height = $this.minHeight / $this.scale;
                        }
                    }
                    if (isDecora && window.EditorStatus != 1) {
                        if ($this.setCss) {
                            $this.element.css({
                                transform: ($this.elementInitialTransform + 'translateX(' + left + 'px)')
                            }).innerWidth(width).innerHeight(height);
                        }
                    } else {
                        if ($this.setCss) {
                            $this.element.css({
                                transform: ($this.elementInitialTransform + 'translateX(' + left + 'px)')
                            }).innerWidth(width);
                        }
                    }

                    eventObj.type = 'resize-left-center';
                    eventObj.width = width;
                    eventObj.deltaLeft = left;

                } else if (currentTarget.hasClass('selection-handle-resize-right-center')) {
                    x = e.pageX - $this.offsetLeftTop.left;
                    y = $this.offsetLeftTop.top - e.pageY;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = Math.acos(y / len);
                    if (e.pageX < $this.offsetLeftTop.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    width = Math.round(len * Math.sin(radians) / $this.scale);

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }

                    //挂件等比缩放7.14
                    if (isDecora && window.EditorStatus != 1) {

                        height = ($this.initialSize.height * width) / $this.initialSize.width;

                        if (height < $this.minHeight / $this.scale) {
                            height = $this.minHeight / $this.scale;
                        }

                        left = $this.deltaLeft = -(width - $this.initialSize.width);
                        top = $this.deltaTop = -(height - $this.initialSize.height);
                    }

                    if (isDecora && window.EditorStatus != 1) {//等比
                        if ($this.setCss) {
                            $this.element.css({
                                transform: $this.elementInitialTransform
                            }).innerWidth(width).innerHeight(height);
                        }
                    } else {//正常
                        if ($this.setCss) {
                            $this.element.css({
                                transform: $this.elementInitialTransform
                            }).innerWidth(width);
                        }
                    }
                    eventObj.type = 'resize-right-center';
                    eventObj.width = width;
                    eventObj.height = height;
                }
                else if (currentTarget.hasClass('selection-handle-resize-left-top')) {
                    x = $this.offsetRightBottom.left - e.pageX;
                    y = e.pageY - $this.offsetRightBottom.top;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = -Math.acos(y / len);
                    if (e.pageX < $this.offsetRightBottom.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    width = Math.round(len * Math.sin(radians) / $this.scale);

                    //挂件等比缩放7.14
                    if (isDecora || shiftKey) {

                        height = ($this.initialSize.height * width) / $this.initialSize.width;


                    } else {
                        height = Math.round(len * -Math.cos(radians) / $this.scale);
                    }

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }
                    if (height < $this.minHeight / $this.scale) {
                        height = $this.minHeight / $this.scale;
                    }

                    left = $this.deltaLeft = -(width - $this.initialSize.width);
                    top = $this.deltaTop = -(height - $this.initialSize.height);

                    if ($this.setCss) {
                        $this.element.css({
                            transform: ($this.elementInitialTransform + 'translate(' + left + 'px,' + top + 'px)')
                        }).innerWidth(width).innerHeight(height);
                    }

                    eventObj.type = 'resize-left-top';
                    eventObj.width = width;
                    eventObj.height = height;
                    eventObj.deltaLeft = left;
                    eventObj.deltaTop = top;
                } else if (currentTarget.hasClass('selection-handle-resize-left-bottom')) {
                    x = e.pageX - $this.offsetRightTop.left;
                    y = e.pageY - $this.offsetRightTop.top;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = -Math.acos(y / len);
                    if (e.pageX < $this.offsetRightTop.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;


                    height = Math.round(len * Math.cos(radians) / $this.scale);

                    //挂件等比缩放7.14
                    if (isDecora || shiftKey) {//等比

                        width = ($this.initialSize.width * height) / $this.initialSize.height;

                        top = $this.deltaTop = -(height - $this.initialSize.height);

                    } else {//正常
                        width = Math.round(len * Math.sin(radians) / $this.scale);
                    }

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }
                    if (height < $this.minHeight / $this.scale) {
                        height = $this.minHeight / $this.scale;
                    }

                    left = $this.deltaLeft = -(width - $this.initialSize.width);

                    if ($this.setCss) {
                        $this.element.css({
                            transform: ($this.elementInitialTransform + 'translateX(' + left + 'px)')
                        }).innerWidth(width).innerHeight(height);
                    }

                    eventObj.type = 'resize-left-bottom';
                    eventObj.width = width;
                    eventObj.height = height;
                    eventObj.deltaLeft = left;

                } else if (currentTarget.hasClass('selection-handle-resize-right-top')) {
                    x = e.pageX - $this.offsetLeftBottom.left;
                    y = $this.offsetLeftBottom.top - e.pageY;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = Math.acos(y / len);
                    if (e.pageX < $this.offsetLeftBottom.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    width = Math.round(len * Math.sin(radians) / $this.scale);

                    //挂件等比缩放7.14
                    if (isDecora || shiftKey) {

                        height = ($this.initialSize.height * width) / $this.initialSize.width;

                        left = $this.deltaLeft = -(width - $this.initialSize.width);

                    } else {
                        height = Math.round(len * Math.cos(radians) / $this.scale);
                    }

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }
                    if (height < $this.minHeight / $this.scale) {
                        height = $this.minHeight / $this.scale;
                    }

                    top = $this.deltaTop = -(height - $this.initialSize.height);

                    if ($this.setCss) {
                        $this.element.css({
                            transform: ($this.elementInitialTransform + 'translateY(' + top + 'px)')
                        }).innerWidth(width).innerHeight(height);
                    }

                    eventObj.type = 'resize-right-top';
                    eventObj.width = width;
                    eventObj.height = height;
                    eventObj.deltaTop = top;

                } else if (currentTarget.hasClass('selection-handle-resize-right-bottom')) {
                    x = e.pageX - $this.offsetLeftTop.left;
                    y = $this.offsetLeftTop.top - e.pageY;
                    len = Math.sqrt(x * x + y * y);

                    radiansMouse = Math.acos(y / len);
                    if (e.pageX < $this.offsetLeftTop.left) {
                        radiansMouse = -radiansMouse;
                    }

                    radians = radiansMouse - $this.radiansStart;

                    width = Math.round(len * Math.sin(radians) / $this.scale);

                    //挂件等比缩放7.14
                    if (isDecora || shiftKey) {

                        height = ($this.initialSize.height * width) / $this.initialSize.width;

                        left = $this.deltaLeft = -(width - $this.initialSize.width);

                    } else {
                        height = -Math.round(len * Math.cos(radians) / $this.scale);
                    }

                    if (width < $this.minWidth / $this.scale) {
                        width = $this.minWidth / $this.scale;
                    }
                    if (height < $this.minHeight / $this.scale) {
                        height = $this.minHeight / $this.scale;
                    }

                    if ($this.setCss) {
                        $this.element.css({transform: $this.elementInitialTransform}).innerWidth(width).innerHeight(height);
                    }
                    eventObj.type = 'resize-right-bottom';
                    eventObj.width = width;
                    eventObj.height = height;
                }

                if (eventObj.width !== undefined) {
                    eventObj.deltaWidth = eventObj.width - $this.initialSize.width;
                }
                if (eventObj.height !== undefined) {
                    eventObj.deltaHeight = eventObj.height - $this.initialSize.height;
                }

                var delaySetCursorClockToken = $($this).data('timesliceSetCursorClockToken');
                if (delaySetCursorClockToken) {
                    clearTimeout(delaySetCursorClockToken);
                }
                $($this).data('timesliceSetCursorClockToken', setTimeout(function () {
                    $this.setCursorToResize(currentTarget);
                    $($this).data('timesliceSetCursorClockToken', null);
                }, 1000 / 60));

                $this.resize.trigger($this, eventObj);
            }

            $this.resetPosition();
        });
        draggable.dragEnd.register(function (e) {
            var currentTarget = $(e.currentTarget);

            var rotation = $this.getCurrentRotation();

            if (currentTarget.is('.selection-handle-rotate')) {
                $this.rotateEnd.trigger($this, {
                    type: 'rotate',
                    element: $this.element,
                    rotatedAngle: $this.rotatedAngle,
                    rotation: rotation,
                    originalEvent: e
                });
            } else {
                var type;
                if (currentTarget.is('.selection-handle-resize-left-top')) {
                    type = 'resize-left-top';
                } else if (currentTarget.is('.selection-handle-resize-left-bottom')) {
                    type = 'resize-left-bottom';
                } else if (currentTarget.is('.selection-handle-resize-right-top')) {
                    type = 'resize-right-top';
                } else if (currentTarget.is('.selection-handle-resize-right-bottom')) {
                    type = 'resize-right-bottom';
                }
                $this.resizeEnd.trigger($this, {
                    type: type,
                    element: $this.element,
                    originalEvent: e,
                    deltaLeft: $this.deltaLeft,
                    deltaTop: $this.deltaTop,
                    rotation: rotation
                });
            }

            if (!$(e.event.target).is('.selection-handle-resize,.selection-handle-rotate')) {
                var delaySetCursorClockToken = $($this).data('timesliceSetCursorClockToken');
                if (delaySetCursorClockToken) {
                    clearTimeout(delaySetCursorClockToken);
                }
                $this.setCursorToDefault();
            }

            $($this).data('drag', false);

            delete $this.rotatedAngle;
            delete $this.deltaLeft;
            delete $this.deltaTop;
        });

        $this.isOn = true;
    };

    SelectionHandles.prototype.off = function () {

        //more_selection.remove();

        this.element.removeClass('transformable-box').removeData('selectionHandels');

        for (var key in this.borders) {
            this.borders[key].remove();
        }
        for (key in this.handles) {
            this.handles[key].remove();
        }
        for (key in this.locators) {
            this.locators[key].remove();
        }

        this.isOn = false;
    };

    SelectionHandles.prototype.show = function () {
        for (var key in this.borders) {
            this.borders[key].css('display', 'block');
        }
        for (key in this.handles) {
            this.handles[key].css('display', 'block');
        }
    };

    SelectionHandles.prototype.hide = function () {
        for (var key in this.borders) {
            this.borders[key].css('display', 'none');
        }
        for (key in this.handles) {
            this.handles[key].css('display', 'none');
        }
    };

    SelectionHandles.prototype.showHandles = function () {
        for (key in this.handles) {
            this.handles[key].css('display', 'block');
        }
        this.borders.linkrotate.css('display', 'block');
    };

    SelectionHandles.prototype.hideHandles = function () {
        for (key in this.handles) {
            this.handles[key].css('display', 'none');
        }
        this.borders.linkrotate.css('display', 'none');
    };

    SelectionHandles.prototype.getCurrentRadians = function () {
        var offsetCenterTop = this.locators.centerTop.offset();

        return this.computePointRadians(offsetCenterTop.left, offsetCenterTop.top);
    };

    SelectionHandles.prototype.getCurrentRotation = function () {
        return this.getCurrentRadians() / Math.PI * 180;
    };

    SelectionHandles.prototype.computePointRadians = function (x, y) {
        var offsetCenter = this.locators.center.offset();

        x = x - offsetCenter.left;
        y = offsetCenter.top - y;

        var radians = Math.acos(y / Math.sqrt(x * x + y * y));
        if (x < 0) {
            radians = -radians;
        }

        return radians;
    };

    SelectionHandles.prototype.computePointRotation = function (x, y) {
        return this.computePointRadians(x, y) / Math.PI * 180;
    };

    SelectionHandles.prototype.resetPosition = function () {
        var $this = this;

        var radians = $this.getCurrentRadians();
        var rotation = radians / Math.PI * 180;

        var offsetCenterTop = $this.locators.centerTop.offset(),
            offsetLeftCenter = $this.locators.leftCenter.offset(),
            offsetCenterBottom = $this.locators.centerBottom.offset(),
            offsetRightCenter = $this.locators.rightCenter.offset();

        for (var key in $this.handles) {
            var handle = $this.handles[key];
            var xy;
            if (key === 'rotate') {
                var len = 12;
                var x = offsetCenterTop.left + len * Math.sin(radians),
                    y = offsetCenterTop.top - len * Math.cos(radians);
                xy = {left: x, top: y};
            } else {
                xy = $this.locators[key].offset();
            }
            handle.css('transform', 'translate(' + xy.left + 'px,' + xy.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-50%)');
        }

        this.borders.top.css({
            width: ((offsetRightCenter.left - offsetLeftCenter.left) / Math.cos(radians)),
            transform: 'translate(' + offsetCenterTop.left + 'px,' + offsetCenterTop.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-50%)'
        });
        this.borders.right.css({
            height: ((offsetCenterBottom.top - offsetCenterTop.top) / Math.cos(radians)),
            transform: 'translate(' + offsetRightCenter.left + 'px,' + offsetRightCenter.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-50%)'
        });
        this.borders.bottom.css({
            width: ((offsetRightCenter.left - offsetLeftCenter.left) / Math.cos(radians)),
            transform: 'translate(' + offsetCenterBottom.left + 'px,' + offsetCenterBottom.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-50%)'
        });
        this.borders.left.css({
            height: ((offsetCenterBottom.top - offsetCenterTop.top) / Math.cos(radians)),
            transform: 'translate(' + offsetLeftCenter.left + 'px,' + offsetLeftCenter.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-50%)'
        });
        this.borders.linkrotate.css({
            transform: 'translate(' + offsetCenterTop.left + 'px,' + offsetCenterTop.top + 'px)rotate(' + rotation + 'deg)translate(-50%,-100%)'
        });
    };

    SelectionHandles.prototype.getLocations = function () {
        var leftTop = this.locators.leftTop.offset();
        var leftBottom = this.locators.leftTop.offset();
        var leftCenter = this.locators.leftCenter.offset();
        var rightTop = this.locators.rightTop.offset();
        var centerTop = this.locators.centerTop.offset();
        var rightBottom = this.locators.rightBottom.offset();
        var rightCenter = this.locators.rightCenter.offset();
        var centerBottom = this.locators.centerBottom.offset();
        var center = this.locators.center.offset();

        return {
            leftTop: leftTop,
            leftBottom: leftBottom,
            leftCenter: leftCenter,
            rightTop: rightTop,
            centerTop: centerTop,
            rightBottom: rightBottom,
            rightCenter: rightCenter,
            centerBottom: centerBottom,
            center: center
        };

    };

    SelectionHandles.prototype.setCursorToResize = function (elementResizeHandle) {
        elementResizeHandle = $(elementResizeHandle);

        var handleRect = elementResizeHandle[0].getBoundingClientRect();

        var x = handleRect.left + handleRect.width / 2;
        var y = handleRect.top + handleRect.height / 2;

        var rotationMouse = this.computePointRotation(x, y);
        if (rotationMouse <= 22.5 && rotationMouse > -22.5) {
            $('body').attr('data-cursor', 'n-resize');
        } else if (rotationMouse <= 67.5 && rotationMouse > 22.5) {
            $('body').attr('data-cursor', 'ne-resize');
        } else if (rotationMouse <= 112.5 && rotationMouse > 67.5) {
            $('body').attr('data-cursor', 'e-resize');
        } else if (rotationMouse <= 157.5 && rotationMouse > 112.5) {
            $('body').attr('data-cursor', 'se-resize');
        } else if (rotationMouse <= -157.5 || rotationMouse > 157.5) {
            $('body').attr('data-cursor', 's-resize');
        } else if (rotationMouse <= -112.5 && rotationMouse > -157.5) {
            $('body').attr('data-cursor', 'sw-resize');
        } else if (rotationMouse <= -67.5 && rotationMouse > -112.5) {
            $('body').attr('data-cursor', 'w-resize');
        } else if (rotationMouse <= -22.5 && rotationMouse > -67.5) {
            $('body').attr('data-cursor', 'nw-resize');
        }
    };

    SelectionHandles.prototype.setCursorToRotate = function () {
        $('body').attr('data-cursor', 'rotate');
    };

    SelectionHandles.prototype.setCursorToDefault = function () {
        $('body').removeAttr('data-cursor');
    };

    module.exports = SelectionHandles;
});