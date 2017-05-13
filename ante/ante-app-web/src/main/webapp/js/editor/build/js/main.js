define('more_selection', function (require, exports, module) {

    var box = [];

    var firstEle = null;

    var isCtrl = false;

    var offset;

    /*清空已选*/
    var remove = function () {
        removeIcon();
        firstEle = null;
        box = [];
        $(document).off('mousedown.more_selection.remove');
    };

    var getboxs = function () {
        return box;
    };

    /*添加到已选*/
    var addele = function (ele) {
        if (isCtrl) {
            if (box.length >= 1) {
                if ($(box[0].element).offsetParent().attr("data-num") !== $(ele.element).offsetParent().attr("data-num")) {//判断是否同一页
                    remove();
                } else {
                    for (var i = 0; i < box.length; i++) {
                        if (box[i].element.index() == ele.element.index()) {//判断有没有已经选择
                            removeIcon(ele);
                            box.splice(i, 1);
                            selectionIcon();
                            return;
                        }
                    }
                }
            }
            box.push(ele);
            selectionIcon();
            $(document).on('mousedown.more_selection.remove', function (e) {
                if ($(e.target).is('.shadingbox,.shadingbox *,.decorabox,.decorabox *,.textbox,.textbox *,.shapebox,.shapebox *,.imgbox,.imgbox *,.content,.selected_icon,.img,.toolbar-button,.preventHideSelectionHandles,.menu-btn,.menu-btn *, .drag_area_vessel, .drag_area_vessel *, .fill_in_vessel, .fill_in_vessel *, #align_center_vessel, #align_center_vessel *')) {
                    return;
                }

                remove();
            });
            return;
        }
        remove();
        box[0] = ele;
        //selectionIcon();

    };

    /*icon显示出来*/
    function selectionIcon() {
        var tempBox;
        for (var i = 1; i < box.length; i++) {
            tempBox = box[i];
            tempBox && $(tempBox.element.children(".selected_icon")).addClass("align_selected");
        }
        if (box[0]) $(box[0].element.children(".selected_icon")).addClass("align_selected_first");
    }

    function removeIcon(ele) {
        if (ele) {
            $(ele.element.children(".selected_icon")).removeClass("align_selected").removeClass("align_selected_first");
            return;
        }
        var tempBox;
        for (var i = 0; i < box.length; i++) {
            tempBox = box[i];
            tempBox && $(tempBox.element.children(".selected_icon")).removeClass("align_selected").removeClass("align_selected_first");
        }
    }

    /*执行对齐动作*/
    var doAlign = function (str) {
        firstEle = box[0];
        offset = getBoxProperties(firstEle);
        var tempBox;
        for (var i = 1; i < box.length; i++) {
            tempBox = box[i];
            switch (str) {
                case "align-left":
                    left(tempBox);
                    break;
                case "align-center":
                    center(tempBox);
                    break;
                case "align-right":
                    right(tempBox);
                    break;
                case "align-top":
                    top(tempBox);
                    break;
                case "align-ju":
                    middle(tempBox);
                    break;
                case "align-bottom":
                    bottom(tempBox);
                    break;
                case "align-vertical":
                    vertical(tempBox);
                    break;
                case "align-horizontal":
                    horizontel(tempBox);
                    break;
                case "align-sameHeight":
                    sameHeight(tempBox);
                    break;
                case "align-sameWidth":
                    sameWidth(tempBox);
                    break;
                case "align-sameSize":
                    sameSize(tempBox);
                    break;
                default:
                    break;

            }
        }

        offset = null;
    };

    function saveData(box) {
        var properties = getBoxProperties(box);
        var element = box.element;
        if (element.hasClass('textbox')) {
            textboxChanged.trigger(view, {
                pageNum: element.parent().attr('data-num'),
                textboxName: element.attr('data-name'),
                obj: {
                    x: sizeConverter.pxToMm(properties.x),
                    y: sizeConverter.pxToMm(properties.y)
                }
            });
        } else if (element.hasClass('imgbox')) {
            imgboxChanged.trigger(view, {
                pageNum: element.parent().attr('data-num'),
                imgboxName: element.attr('data-name'),
                obj: {
                    x: sizeConverter.pxToMm(properties.x),
                    y: sizeConverter.pxToMm(properties.y)
                }
            });
        } else if (element.hasClass('decorabox')) {
            _decoraboxChanged.trigger(view, {
                pageNum: element.parent().attr('data-num'),
                decoraboxName: element.attr('data-name'),
                obj: {
                    x: sizeConverter.pxToMm(properties.x),
                    y: sizeConverter.pxToMm(properties.y)
                }
            });
        } else if (element.hasClass('shapebox')) {
            _shapeboxChanged.trigger(view, {
                pageNum: element.parent().attr('data-num'),
                shapeboxName: element.attr('data-name'),
                obj: {
                    x: sizeConverter.pxToMm(properties.x),
                    y: sizeConverter.pxToMm(properties.y)
                }
            });
        } else if (element.hasClass('shadingbox')) {
            _shadingboxChanged.trigger(view, {
                pageNum: element.parent().attr('data-num'),
                shadingboxName: element.attr('data-name'),
                obj: {
                    x: sizeConverter.pxToMm(properties.x),
                    y: sizeConverter.pxToMm(properties.y)
                }
            });
        }
    }

    var setCtrl = function (boolean) {
        isCtrl = boolean;
    };

    var getCtrl = function () {
        return isCtrl;
    };

    var setBoxProperties;
    var getBoxProperties;
    var imgboxChanged;
    var view;
    var sizeConverter;
    var textboxChanged;
    var selectionHandlesResizeEnd;

    function left(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                x: offset.x
            }
        });
        saveData(tempBox);
    }

    function center(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                x: (offset.x + (offset.width - getBoxProperties(tempBox).width) / 2)
            }
        });
        saveData(tempBox);
    }

    function right(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                x: (offset.x + (offset.width - getBoxProperties(tempBox).width))
            }
        });
        saveData(tempBox);
    }

    function top(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                y: offset.y
            }
        });
        saveData(tempBox);
    }

    function middle(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                y: (offset.y + (offset.height - getBoxProperties(tempBox).height) / 2)
            }
        });
        saveData(tempBox);
    }

    function bottom(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                y: (offset.y + offset.height - getBoxProperties(tempBox).height)
            }
        });
        saveData(tempBox);
    }

    function vertical(tempBox) {
        box.each(function () {
            $(this)
        })
    }

    function horizontel(tempBox) {

    }

    function sameHeight(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                height: offset.height
            }
        });
        selectionHandlesResizeEnd({element: tempBox.element})
    }

    function sameWidth(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                width: offset.width
            }
        });
        selectionHandlesResizeEnd({element: tempBox.element})
    }

    function sameSize(tempBox) {
        setBoxProperties({
            element: tempBox.element,
            obj: {
                height: offset.height,
                width: offset.width
            }
        });
        selectionHandlesResizeEnd({element: tempBox.element})
    }

    exports.remove = remove;
    exports.addele = addele;
    exports.doAlign = doAlign;
    exports.setCtrl = setCtrl;
    exports.getCtrl = getCtrl;
    exports.getboxs = getboxs;
    exports.setResized = function (fun) {
        selectionHandlesResizeEnd = fun;
    };
    exports.setSizeConverter = function (fun) {
        sizeConverter = fun
    };
    exports.setView = function (_view) {
        view = _view;
    };
    exports.boxChanged = function (i, t) {
        imgboxChanged = i;
        textboxChanged = t;
    };
    exports.setProperties = function (setFun, getFun) {
        setBoxProperties = setFun;
        getBoxProperties = getFun;

    };
});
define('uploader', function(require, exports, module) {

    var qiniuDefaults = {
        runtimes: 'gears,html5,flash',
        flash_swf_url: '/js/lib/plupload/Moxie.swf',
        silverlight_xap_url: '/js/lib/plupload/Moxie.xap',
        dragdrop: true,
        chunk_size: '4Mb', // 分割上传，七牛那边会报上传错误：请求报文格式错误
        max_retries: 1,//当发生plupload.HTTP_ERROR错误时的重试次数
        filters: {
            //
            max_file_size: '30mb',
            prevent_duplicates: true //不允许选取重复文件
        },
        mime_types: 'image/*',
        auto_start: false
    };

   function Uploader (options, init) {
        /**
         * 所属ID
         */
        this.belongId = options.belongId;

        /**
         * 所属类型
         */
        this.belongType = 'book';

        this.bucket = options.bucket || 'yearbook-album';
        this.domain = options.domain || 'http://' + me.bucket + '.yearbook.com.cn/';

        init = $.extend({}, {
            'Error': function (up, err, errTip) {
                if (err.code === plupload.FILE_SIZE_ERROR) {
                    errTip = "图片太大了，换一个小的吧";
                    SureMsg.alert(errTip);
                } else {
                    console.log(errTip);
                }
            },
            'Key': function (up, file) {
                var uuid = file.md5 || new UUID().id;
                return "imageRes/" + uuid;
            }
        }, init);


        var tokenOpts = {
            uptoken_url: "/qiniu/upToken?scope=" + this.bucket
        };
        if (options.uptoken) {
            tokenOpts = {};
        }

        options = $.extend({}, qiniuDefaults, tokenOpts, options, {
            init: init
        });

        this.qiniuUploader = Qiniu.uploader(options);
    }

    Uploader.prototype.startUpload = function () {
        this.qiniuUploader.start();
    };

    Uploader.prototype.stopUpload = function () {
        this.qiniuUploader.stop();
    };

    module.exports = Uploader;

});
define('imgload', function (require, exports, module) {
    function imgload(url, onready) {
        var img = document.createElement('img');

        img.src = url;

        if (img.complete || img.width * img.height > 0) {
            onready.call(img, img.width, img.height);
            return;
        }

        var clockToken = setInterval(function () {
            if (img.complete || img.width * img.height > 0) {
                onready.call(img, img.width, img.height);
                clearInterval(clockToken);
            }
        }, 1000 / 60);
    }

    module.exports = imgload;
});
define('zoombar',['event','transform','draggable'], function (require, exports, module) {
    var Event = require('event'),
        transform = require('transform'),
        Draggable = require('draggable');

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
define('selection-handles',['draggable','event','more_selection'], function (require, exports, module) {
    var Draggable = require('draggable'),
        Event = require('event'),
        more_selection = require('more_selection');

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
define('draggable',['event'], function (require, exports, module) {
    var Event = require('event');

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
define('event', function (require, exports, module) {
    module.exports = Event;

    function Event() {
        this.funcList = [];
    }

    Event.prototype.trigger = function (sender, e) {
        for (var i = 0; i < this.funcList.length; i++) {
            this.funcList[i].call(sender, e);
        }
        return this;
    };

    Event.prototype.register = function (func) {
        this.funcList.push(func);
        return this;
    };

    Event.prototype.unregister = function (func) {
        for (var i = 0; i < this.funcList.length; i++) {
            if (this.funcList[i] === func) {
                this.funcList.splice(i, 1);
            }
        }
        return this;
    };
});
define('defaultSlot', function (require, exports, module) {

    function defalut() {
        console.log("槽位类型出错！");
    }

    exports.template = defalut;
    exports.create = defalut;
    exports.getAttr = defalut;
    exports.setAttr = defalut;
});
define('shapeSlot',['size-converter','transform'], function (require, exports, module) {
    var SizeConverter = require('size-converter');
    var transform = require('transform');
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
define('shadingSlot',['size-converter','transform'], function (require, exports, module) {
    var SizeConverter = require('size-converter');
    var transform = require('transform');
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
define('decorationSlot',['size-converter','transform'], function (require, exports, module) {
    var SizeConverter = require('size-converter');
    var transform = require('transform');
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
define('textSlot',['size-converter','transform'], function (require, exports, module) {

    var SizeConverter = require('size-converter');
    var transform = require('transform');
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
define('imageSlot',['size-converter','transform','imgload','opEvent'], function (require, exports, module) {

    var SizeConverter = require('size-converter');
    var transform = require('transform');
    var imgload = require('imgload');
    var opEvent = require('opEvent');

    var sizeConverter = new SizeConverter(108);

    var templateId = "#book_edit-template_imageslot";

    function template() {
        return  $(templateId).html()
    }

    function create(imgSlot, photo) {
        var $imgSlot = $(template());

        var x = imgSlot.x,
            y = imgSlot.y;

        $imgSlot.attr({
            'data-name': imgSlot.name,
            'data-slot-id': imgSlot.slotId
        });

        //设置图片槽位数据
        setImgSlotAttr($imgSlot, {
            locked: imgSlot.locked !== false,
            index: imgSlot.index,
            x: sizeConverter.mmToPx(x),
            y: sizeConverter.mmToPx(y),
            width: (sizeConverter.mmToPx(imgSlot.width) + 'px'),
            height: (sizeConverter.mmToPx(imgSlot.height) + 'px'),
            rotation: imgSlot.rotation,
            borderWidth: sizeConverter.ptToPx(imgSlot.borderWidth),
            borderColor: imgSlot.borderColor,
            opacity : imgSlot.opacity
        });


        if ((imgSlot.image && photo) || imgSlot.themeImage) {

            //内部图片加载完成之后回调
            var onImgReady = function () {
                //区分照片数据容错
                var imageData = imgSlot.themeImage || imgSlot.image,
                    imageOriWidth = (photo && photo.width) ? photo.width : undefined,
                    imageOriHeight = (photo && photo.height) ? photo.height : undefined;

                $imgSlot.children('.content').children('.img').replaceWith($(this).addClass('img'));
                $imgSlot.children('.content').children('.img').attr({
                    'data-id': imageData.id,
                    'data-filter': imageData.filter
                }).data('originalSize', {
                    width: imageOriWidth,
                    height: imageOriHeight
                }).css({
                    visibility: 'visible',
                    width: this.width,
                    height: this.height
                });

                setImgSlotAttr($imgSlot, {
                    image: {
                        x: sizeConverter.mmToPx(imageData.x),
                        y: sizeConverter.mmToPx(imageData.y),
                        width: sizeConverter.mmToPx(imageData.width),
                        rotation: imageData.rotation
                    }
                });

                $imgSlot.addClass('has-img').removeClass('img_loading');
            };

            $imgSlot.addClass('img_loading');

            //有themeImage 就说明是固定照片的
            var imageSrc;
            if (imgSlot.themeImage) {
                imageSrc = imgSlot.themeImage.url;
            } else {
                imageSrc = photo.ir.src;
            }

            if (imageSrc) {
                imgload(imageSrc, function () {
                    onImgReady.call(this);
                });
            } else {
                //generateEditImgDataURL(photo, function (e) {
                //    imgReady(e.dataURL, function () {
                //        onImgReady.call(this);
                //    });
                //});
            }
        } else {
            if (imgSlot.image && imgSlot.image.id && imgSlot.image.id != "" && !photo) {
                $imgSlot.addClass('photo_not_found');
            }
            $imgSlot.children('.content').children('.img').remove();
        }

        if (imgSlot.image)
            $imgSlot.attr('data-fileName', imgSlot.image.fileName);

        return $imgSlot;
    }

    function getImgSlotAttr(el) {
        var $elSlot = $(el), innerImg = $elSlot.children('.content').children('.img');

        var curTransform = transform.getCurrent($elSlot);

        var slotData = {
            locked: $elSlot.attr('data-locked') === 'true',
            x: curTransform.translationX,
            y: curTransform.translationY,
            rotation: curTransform.rotation,
            width: parseFloat($elSlot.css('width')),
            height: parseFloat($elSlot.css('height')),
            index: parseFloat($elSlot.attr('data-index')),
            borderWidth: parseFloat($elSlot.attr('data-borderWidth')) || 0,
            borderColor: $elSlot.attr('data-borderColor') || '#ffffff',
            opacity : parseFloat($elSlot.attr('data-opacity'))
        };

        if (innerImg.length !== 0) {
            var curImgTransform = transform.getCurrent(innerImg);

            slotData.image = {
                id: innerImg.attr('data-id'),
                width: (curImgTransform.scale * innerImg.width()),
                x: curImgTransform.translationX,
                y: curImgTransform.translationY,
                rotation: curImgTransform.rotation,
                url : innerImg.attr('src')
            };
        }

        return slotData;
    }

    function setImgSlotAttr(el, attr) {
        var $elSlot = $(el), innerImg = $elSlot.children('.content').children('.img'),
            locked = attr.locked,
            borderWidth = attr.borderWidth,
            borderColor = attr.borderColor,
            x = attr.x,
            y = attr.y,
            width = attr.width,
            height = attr.height,
            rotation = attr.rotation,
            index = attr.index,
            opacity = attr.opacity,
            image = attr.image ? {
                x: attr.image.x,
                y: attr.image.y,
                width: attr.image.width,
                rotation: attr.image.rotation
            } : (attr.image === null ? null : undefined);

        if (locked !== undefined) {
            $elSlot.attr('data-locked', locked);
        }
        if (borderWidth !== undefined) {
            $elSlot.attr('data-borderWidth', borderWidth).css('border-width', borderWidth);
        }
        if (borderColor !== undefined) {
            $elSlot.attr('data-borderColor', borderColor).css('border-color', borderColor);
        }
        if (width !== undefined) {
            $elSlot.css('width', width);

            if ($elSlot.parent().attr('data-seq')) {
                opEvent.eImageSlotResize.trigger(exports, {
                    pageSeq: $elSlot.parent().attr('data-seq'),
                    name: $elSlot.attr('data-name'),
                    width: $elSlot.width(),
                    height: $elSlot.height(),
                    widthMM: sizeConverter.pxToMm($elSlot.width()),
                    heightMM: sizeConverter.pxToMm($elSlot.height())
                });
            }
        }
        if (height !== undefined) {
            $elSlot.css('height', height);

            if ($elSlot.parent().attr('data-seq')) {
                opEvent.eImageSlotResize.trigger(exports, {
                    pageSeq: $elSlot.parent().attr('data-seq'),
                    name: $elSlot.attr('data-name'),
                    width: $elSlot.width(),
                    height: $elSlot.height(),
                    widthMM: sizeConverter.pxToMm($elSlot.width()),
                    heightMM: sizeConverter.pxToMm($elSlot.height())
                });
            }
        }
        if (x !== undefined && y !== undefined) {
            transform.translate($elSlot, x, y);
            $elSlot.css('transform', 'translate(' + ($elSlot.outerWidth() / 2) + 'px,' + ($elSlot.outerHeight() / 2) + 'px)' +
                transform.getCurrentTransform($elSlot) +
                'translate(' + (-$elSlot.outerWidth() / 2) + 'px,' + (-$elSlot.outerHeight() / 2) + 'px)');
        } else {
            if (x !== undefined) {
                transform.translateX($elSlot, x);
                $elSlot.css('transform', 'translate(' + ($elSlot.outerWidth() / 2) + 'px,' + ($elSlot.outerHeight() / 2) + 'px)' +
                    transform.getCurrentTransform($elSlot) +
                    'translate(' + (-$elSlot.outerWidth() / 2) + 'px,' + (-$elSlot.outerHeight() / 2) + 'px)');
            }
            if (y !== undefined) {
                transform.translateY($elSlot, y);
                $elSlot.css('transform', 'translate(' + ($elSlot.outerWidth() / 2) + 'px,' + ($elSlot.outerHeight() / 2) + 'px)' +
                transform.getCurrentTransform($elSlot) +
                    'translate(' + (-$elSlot.outerWidth() / 2) + 'px,' + (-$elSlot.outerHeight() / 2) + 'px)');
            }
        }
        if (rotation !== undefined) {
            transform.rotate($elSlot, rotation);
            $elSlot.css('transform', 'translate(' + ($elSlot.outerWidth() / 2) + 'px,' + ($elSlot.outerHeight() / 2) + 'px)' +
                transform.getCurrentTransform($elSlot) +
                'translate(' + (-$elSlot.outerWidth() / 2) + 'px,' + (-$elSlot.outerHeight() / 2) + 'px)');
        }

        if (index !== undefined) {
            $elSlot.css('z-index', index).attr('data-index', index);
        }

        if (opacity !== undefined) {
            $elSlot.css('opacity', opacity).attr('data-opacity', opacity);
        }

        if (image !== undefined) {
            if (image !== null) {
                var currentTransform;

                if (image.x !== undefined && image.y !== undefined) {
                    transform.translate(innerImg, image.x, image.y);
                    currentTransform = transform.getCurrent(innerImg);
                    innerImg.css({
                        transform: ('translate(' + (innerImg.width() * currentTransform.scale / 2).toFixed(6) + 'px,' +
                        (innerImg.height() * currentTransform.scale / 2).toFixed(6) + 'px) ' +
                        transform.getCurrentTransform(innerImg) + 'translate(-50%,-50%)')
                    });
                } else {
                    if (image.x !== undefined) {
                        transform.translateX(innerImg, image.x);
                        currentTransform = transform.getCurrent(innerImg);
                        innerImg.css({
                            transform: ('translate(' + (innerImg.width() * currentTransform.scale / 2).toFixed(6) + 'px,' +
                            (innerImg.height() * currentTransform.scale / 2).toFixed(6) + 'px) ' +
                            transform.getCurrentTransform(innerImg) + 'translate(-50%,-50%)')
                        });
                    }
                    if (image.y !== undefined) {
                        transform.translateY(innerImg, image.y);
                        currentTransform = transform.getCurrent(innerImg);
                        innerImg.css({
                            transform: ('translate(' + (innerImg.width() * currentTransform.scale / 2).toFixed(6) + 'px,' +
                            (innerImg.height() * currentTransform.scale / 2).toFixed(6) + 'px) ' +
                            transform.getCurrentTransform(innerImg) + 'translate(-50%,-50%)')
                        });
                    }
                }

                if (image.width !== undefined) {
                    transform.scale(innerImg, image.width / innerImg.width());
                    currentTransform = transform.getCurrent(innerImg);

                    innerImg.css({
                        transform: ('translate(' + (innerImg.width() * currentTransform.scale / 2).toFixed(6) + 'px,' +
                        (innerImg.height() * currentTransform.scale / 2).toFixed(6) + 'px) ' +
                        transform.getCurrentTransform(innerImg) + 'translate(-50%,-50%)')
                    });

                    if ($elSlot.parent().attr('data-seq')) {
                        //_imgboxImageScale.trigger(exports, {
                        //    pageNum: $elSlot.parent().attr('data-num'),
                        //    imgboxName: $elSlot.attr('data-name'),
                        //    photoId: innerImg.attr('data-id'),
                        //    imgWidthMM: sizeConverter.pxToMm(image.width)
                        //});
                    }
                }

                if (image.rotation !== undefined) {
                    transform.rotate(innerImg, image.rotation);
                    currentTransform = transform.getCurrent(innerImg);
                    innerImg.css({
                        transform: ('translate(' + (innerImg.width() * currentTransform.scale / 2).toFixed(6) + 'px,' +
                        (innerImg.height() * currentTransform.scale / 2).toFixed(6) + 'px) ' +
                        transform.getCurrentTransform(innerImg) + 'translate(-50%,-50%)')
                    });
                }
            } else {
                $elSlot.removeClass('has-img');
                innerImg.remove();
            }
        }
    }

    function isEmpty(el) {
        el = $(el);
        return el.children('.content').children('.img').length == 0;
    }

    function preventImgOutSlot(el) {
        el = $(el);

        var properties = getImgSlotAttr(el);

        var currentTransform = transform.getCurrentTransform(el);

        el.css('transform', currentTransform + 'translate(50%,50%)' + 'rotate(' + (-properties.rotation) + 'deg)translate(-50%,-50%)');

        var rectImgbox = el[0].getBoundingClientRect(),
            rectImg = el.children('.content').children('.img')[0].getBoundingClientRect(),
            bookScale = view.edit.getBookCurrentScale();

        el.css('transform', currentTransform);

        var x = properties.image.x,
            y = properties.image.y,
            changed = false;
        if (rectImg.width <= rectImgbox.width) {
            if (rectImg.left < rectImgbox.left) {
                x = properties.image.x + (rectImgbox.left - rectImg.left) / bookScale;
                changed = true;
            } else if (rectImg.right > rectImgbox.right) {
                x = properties.image.x + (rectImgbox.right - rectImg.right) / bookScale;
                changed = true;
            }
        } else {
            if (rectImg.left > rectImgbox.left) {
                x = properties.image.x + (rectImgbox.left - rectImg.left) / bookScale;
                changed = true;
            } else if (rectImg.right < rectImgbox.right) {
                x = properties.image.x + (rectImgbox.right - rectImg.right) / bookScale;
                changed = true;
            }
        }
        if (rectImg.height <= rectImgbox.height) {
            if (rectImg.top < rectImgbox.top) {
                y = properties.image.y + (rectImgbox.top - rectImg.top) / bookScale;
                changed = true;
            } else if (rectImg.bottom > rectImgbox.bottom) {
                y = properties.image.y + (rectImgbox.bottom - rectImg.bottom) / bookScale;
                changed = true;
            }
        } else {
            if (rectImg.top > rectImgbox.top) {
                y = properties.image.y + (rectImgbox.top - rectImg.top) / bookScale;
                changed = true;
            } else if (rectImg.bottom < rectImgbox.bottom) {
                y = properties.image.y + (rectImgbox.bottom - rectImg.bottom) / bookScale;
                changed = true;
            }
        }
        if (changed) {
            setImgSlotAttr(el, {
                image: {
                    x: x,
                    y: y
                }
            });
        }

        return {
            x: x,
            y: y
        };
    }

    function zoomImgInSlot(el, type, callback, doNotDelayEvent) {
        var el = $(el),
            img = el.children('.content').children('img'),
            ratio = img.height() / img.width();

        var properties = getImgSlotAttr(el);
        var width, center = false;

        switch (type) {
            case 'zoomin':
                width = properties.image.width + sizeConverter.mmToPx(10);
                break;
            case 'zoomout':
                width = properties.image.width - sizeConverter.mmToPx(10);
                break;
            case 'adjust':
            case 'fill':
                setImgSlotAttr(el, {
                    rotation: 0
                });
                var rect = img[0].getBoundingClientRect();
                setImgSlotAttr(el, {
                    rotation: properties.rotation
                });
                var bookScale = view.edit.getBookCurrentScale();

                switch (type) {
                    case 'adjust':
                        if (rect.width / rect.height > properties.width / properties.height) {
                            width = properties.width * properties.image.width / (rect.width / bookScale);
                        } else {
                            width = properties.height * (properties.image.width) / (rect.height / bookScale);
                        }
                        break;
                    case 'fill':
                        if (rect.width / rect.height > properties.width / properties.height) {
                            width = properties.height * (properties.image.width) / (rect.height / bookScale);
                        } else {
                            width = properties.width * properties.image.width / (rect.width / bookScale);
                        }
                        break;
                }

                center = true;

                break;
        }

        var result = scaleImgInSlot(el, width, center);
        el.data('backImgWrapper') && el.data('backImgWrapper').css('transform', transform.getCurrentTransform(img));

        var pageSeq = el.parent().attr('data-seq'),
            name = el.attr('data-name');
        if ($(el).data('zoomChangeEventClockToken')) {
            clearTimeout($(el).data('zoomChangeEventClockToken'));
            $(el).removeData('zoomChangeEventClockToken');
        }
        $(el).data('zoomChangeEventClockToken', setTimeout(function () {
            opEvent.eImageSlotChanged.trigger(exports, {
                pageSeq: pageSeq,
                name: name,
                obj: {
                    image: {
                        x: sizeConverter.pxToMm(result.x),
                        y: sizeConverter.pxToMm(result.y),
                        width: sizeConverter.pxToMm(result.width)
                    }
                }
            });

            if (typeof callback === 'function') {
                callback.call(view.edit);
            }
        }, doNotDelayEvent ? 0 : 400));
    }

    function scaleImgInSlot(el, width, center) {
        var img = el.children('.content').children('.img'),
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
        var properties = getImgSlotAttr(el);

        setImgSlotAttr(el, {
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

        setImgSlotAttr(el, {
            image: {
                x: x,
                y: y
            }
        });

        var finalXY = preventImgOutSlot(el);

        return {
            x: finalXY.x,
            y: finalXY.y,
            width: width
        };
    }

    function setImgSlotModeToEditing(el) {
        el = $(el);

        if (el.hasClass('photo_not_found')) {
           SureMsg.error('这张照片没有上传完，请续传');
        }

        if (el.children('.content').children('.img').length === 0) {
            return;
        }

        if (!el.hasClass('editing')) {
            var img = el.children('.content').children('.img');
            var backImg = img.clone().removeAttr('style');
            var backImgWrapper = $($('#template_edit_move_img_backimg_wrapper').html()).append(backImg);
            el.data('backImgWrapper', backImgWrapper);
            backImgWrapper.attr('style', img.attr('style')).prependTo(el);
            $(document).on('pointerdown.hide.closeImgboxEditingMode', function (e) {
                if ($(e.target).is(el.add(el.find('*')).add($('.edit_box_tool')).add($('.edit_box_tool').find('*')))) {
                    return;
                }

                el.removeClass('editing').data('backImgWrapper').remove();
                el.removeData('backImgWrapper');
                $(document).off('.closeImgboxEditingMode');
            });
            el.data('selectionHandles').hide();
            el.addClass('editing');
        }
    }

    function  isLocked(el) {
        var $elSlot = $(el);
        return $elSlot.attr('data-locked') === 'true';
    }

    exports.template = template;
    exports.create = create;
    exports.getAttr = getImgSlotAttr;
    exports.setAttr = setImgSlotAttr;

    exports.isEmpty = isEmpty;
    exports.isLocked = isLocked;

    exports.preventImgOutSlot = preventImgOutSlot;
    exports.zoomImgInSlot = zoomImgInSlot;
    exports.scaleImgInSlot = scaleImgInSlot;

    exports.setImgSlotModeToEditing = setImgSlotModeToEditing;

});
define('photo',['md5'], function (require, exports, module) {
    var md5 = require('md5');

    var _isTpl = true;

    if (typeof isTpl != 'undefined') {
        _isTpl = isTpl;
    }

    var _allPhoto = [];
    var _photo = {

        getById: function (id) {
            for (var i = 0; i < _allPhoto.length; i++) {
                if (_allPhoto[i].ir.checksum === id) {
                    return _allPhoto[i];
                }
            }
            return null;
        },

        delById: function (id) {
            for (var i = 0; i < _allPhoto.length; i++) {
                if (_allPhoto[i].ir.checksum === id) {
                    _allPhoto.splice(i, 1);
                }
            }
        },

        getPhotos: function () {
            return _allPhoto;
        },

        getPhotoInPage: function (pages) {
            if (!(pages instanceof Array)) {
                pages = [pages];
            }
            var photos = {};
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                if (page && page.imageSlotList) {
                    for (var j = 0; j < page.imageSlotList.length; j++) {
                        var imgSlot = page.imageSlotList[j];
                        if (imgSlot.image) {
                            photos[imgSlot.image.id] = _photo.getById(imgSlot.image.id);
                        }
                    }
                }
            }
            return photos;
        },

        getBookPhoto: function (bookId, callback) {

            var url = '/api/book/' + bookId + "/photo/?tpl=false";
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/?tpl=true";

            SureAjax.ajax({
                url: url,
                type: "GET",
                async: false,
                headers: {
                    Accept: "application/json"
                },

                success: function (page) {
                    _allPhoto = page.data;

                    //if (_allPhoto.length > 0) {
                    //    var _a = {};
                    //    $.each(_allPhoto, function(p) {
                    //        _a[p.ir.checksum] = p;
                    //    });
                    //    _allPhoto = _a;
                    //}

                    if (typeof callback == 'function') {
                        callback(_allPhoto);
                    }
                }
            });
        },

        addPhoto: function (bookId, name, desc, ir, callback) {
            var url = '/api/book/' + bookId + "/photo/?name=" + name + "&desc=" + desc + "&tpl=false";
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/?name=" + name + "&desc=" + desc + "&tpl=true";

            SureAjax.ajax({
                url: url,
                type: "POST",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(ir),
                success: function (il) {
                    _allPhoto.push(il);
                    callback(il);
                }
            });
        },

        getPhoto: function (bookId, checkSum, callback) {

            var url = '/api/book/' + bookId + "/photo/" + checkSum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checkSum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                success: callback
            });
        },

        deletePhoto: function (bookId, checksum, callback) {
            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "DELETE",
                headers: {
                    Accept: "application/json"
                },
                success: function (response) {
                    if (typeof callback == 'function') {
                        callback(response);
                    }
                },
                parseError: false,
                error: function () {
                    SureMsg.msg("图片已经入册，不能删除 !");
                }
            });
        },


        deletePhotoByChecksum: function (bookId, checksum, callback) {

            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "DELETE",
                headers: {
                    Accept: "application/json"
                },
                success: function (response) {
                    if (typeof callback == 'function') {
                        callback(response);
                    }
                },
                parseError: false,
                error: function () {
                    SureMsg.msg("图片已经入册，不能删除 !");
                }
            });
        },

        checkILByChecksum: function (checksum, bookId, found, notFound, isAddToBook) {

            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';


            var il = null;
            var async = typeof(found) == "function";
            if (isAddToBook == false) {
                url = url + "?addToBook=false";
            }
            SureAjax.ajax({
                async: async,
                parseError: false,
                url: url,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")
                        found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")
                        notFound(ret);
                }
            });
            return il;
        },

        isILExist: function (file, bookId, existCb, noExistCb, isAddToBook) {
            md5.calMd5(file, function (md5) {
                var il = _photo.getById(md5);
                if (il != null) {
                    if (typeof(existCb) === "function")existCb(il);
                } else {
                    if (typeof(noExistCb) === "function")noExistCb(md5);
                }
            });
        }
    };

    return _photo;
});
define('book',['canvas'], function (require, exports, module) {

    var canvas = require('canvas');

    var _bookId, _userId, _book;

    //变化的页面列表
    var _changedPages = window.changed = {};

    var _toGeneratePreviewPages = {};
    var _generatePreviewQueue = {};

    var _historys = {},  _undoHistorys = {};

    var slotPrefix = {
        image : 'image',
        text : 'text',
        shape : 'shape',
        decoration : 'decoration',
        shading : 'shading'
    };

    var slotType = {
        image : 'imageslot',
        text : 'textslot',
        shape : 'shapeslot',
        decoration : 'decorationslot',
        shading : 'shadingslot'
    };

    /**
     * 对象初始化
     * 必须先执行初始化才可以使用
     *
     * @param bookRes   书册资源对象
     * @param userId    用户ID
     */
    function init(bookInfo) {
        window.bookId = _bookId = bookInfo.bookId;
        window.userId = _userId = bookInfo.userId;

        _book = bookInfo;

        initSort();
    }

    function getBookInfo() {
        return _book;
    }

    function update(book) {
        if (book.name != undefined) {
            _book.name = book.name;
        }

        if (book.width != undefined) {
            _book.width = book.width;
            $.each(getAllPages(true), function(i, page) {
                page.width = book.width;
            })
        }

        if (book.height != undefined) {
            _book.height = book.height;
            $.each(getAllPages(true), function(i, page) {
                page.height = book.height;
            })
        }

        if (book.status != undefined) {
            _book.status = book.status;
        }

        if (book.thumbnail != undefined) {
            _book.thumbnail = book.thumbnail;
        }
    }

    function publish(isCreateThumb, onSuccess, onError) {
        if (isCreateThumb) {
            generateThumb('all', function() {
                update({
                    status : 'publish'
                });
                saveChanges(onSuccess, onError);
            });
        } else {
            update({
                status : 'publish'
            });
            saveChanges(onSuccess, onError);
        }
    }

    function updateThumbnail(pageSeq,  thumbnail) {
        var page = getPageBySeq(pageSeq);
        page.thumbnail = thumbnail;

        if (pageSeq == 'front-cover') {
            update({
                thumbnail : thumbnail
            });
        }
    }

    function get() {
        return _book;
    }


    /**
     * 获取书册ID
     *
     * @returns {*}
     */
    function getBookId() {
        return _bookId;
    }

    /**
     * 获取用户ID
     *
     * @returns {*}
     */
    function getUserId() {
        return _userId;
    }

    /**
     * 获取书册所有的书页
     *
     * @param isNoClone 不复制
     * @returns {*}
     */
    function getAllPages(isNoClone) {
        var allPages;

        if (isNoClone)
            allPages = [].concat(_book.innerPage);
        else
            allPages = JSON.parse(JSON.stringify(_book.innerPage));

        if (_book.flyleaf) {
            allPages.unshift(_book.flyleaf);
        }
        if (_book.backFlap) {
            allPages.unshift(_book.backFlap);
        }
        if (_book.frontFlap) {
            allPages.unshift(_book.frontFlap);
        }
        if (_book.spine) {
            allPages.unshift(_book.spine);
        }
        if (_book.cover) {
            allPages.unshift(_book.cover);
        }
        if (_book.copyright) {
            allPages.push(_book.copyright);
        }
        if (_book.backCover) {
            allPages.push(_book.backCover);
        }

        return allPages;
    }

    function getPageBySeq(seq) {
        if (seq === undefined)
            return null;

        if (seq === 'front-cover') {
            return _book.cover;
        } else if (seq === 'spine') {
            return _book.spine;
        } else if (seq === 'front-flap') {
            return _book.frontFlap;
        } else if (seq === 'back-flap') {
            return _book.backFlap;
        } else if (seq === 'flyleaf') {
            return _book.flyleaf;
        } else if (seq === "copyright") {
            return _book.copyright;
        } else if (seq === 'back-cover') {
            return _book.backCover;
        } else {
            for (var i = 0; i < _book.innerPage.length; i++) {
                var page = _book.innerPage[i];
                if (page.seq.toString() === seq.toString()) {
                    return page;
                }
            }
        }
        return null;
    }

    function getImageSlotByPageSeqAndName(pageSeq, name) {
        var page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.imageSlotList.length; i++) {
            var imageSlot = page.imageSlotList[i];
            if (imageSlot.name.toString() === name.toString()) {
                return imageSlot;
            }
        }
        return null;
    }

    function getTextSlotByPageSeqAndName(pageSeq, name) {
        var page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.textSlotList.length; i++) {
            var textSlot = page.textSlotList[i];
            if (textSlot.name.toString() === name.toString()) {
                return textSlot;
            }
        }
        return null;
    }

    function getShapeSlotByPageSeqAndName(pageSeq, name) {
        var page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.shapeSlotList.length; i++) {
            var shapeSlot = page.shapeSlotList[i];
            if (shapeSlot.name.toString() === name.toString()) {
                return shapeSlot;
            }
        }
        return null;
    }

    function getDecorationSlotByPageSeqAndName(pageSeq, name) {
        var page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.decorationSlotList.length; i++) {
            var decorationSlot = page.decorationSlotList[i];
            if (decorationSlot.name.toString() === name.toString()) {
                return decorationSlot;
            }
        }
        return null;
    }

    function getShadingSlotByPageSeqAndName(pageSeq, name) {
        var page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.shadingSlotList.length; i++) {
            var shadingSlot = page.shadingSlotList[i];
            if (shadingSlot.name.toString() === name.toString()) {
                return shadingSlot;
            }
        }
        return null;
    }


    function generateSlotName(prefix, slotList) {
        var names = [];

        for (var i = 0; i < slotList.length; i++) {
            names.push(slotList[i].name);
        }
        var name;
        var hasNot = false;
        for (i = 1; hasNot === false; i++) {
            name = prefix + '_' + i;
            hasNot = true;
            for (var j = 0; j < names.length; j++) {
                if (name === names[j]) {
                    hasNot = false;
                    break;
                }
            }
        }
        return name;
    }

    function generateSlotIndex(pageSeq) {
        var max = 0, current, page = getPageBySeq(pageSeq);
        for (var i = 0; i < page.imageSlotList.length; i++) {
            var imageSlot = page.imageSlotList[i];
            current = parseFloat(imageSlot.index);
            if (current > max) {
                max = current;
            }
        }
        for (i = 0; i < page.textSlotList.length; i++) {
            var textSlot = page.textSlotList[i];
            current = parseFloat(textSlot.index);
            if (current > max) {
                max = current;
            }
        }
        if (page.decorationSlotList != null && page.decorationSlotList.length > 0) {
            for (i = 0; i < page.decorationSlotList.length; i++) {
                var decoraSlot = page.decorationSlotList[i];
                current = parseFloat(decoraSlot.index);
                if (current > max) {
                    max = current;
                }
            }
        }
        if (page.shapeSlotList != null && page.shapeSlotList.length > 0) {
            for (i = 0; i < page.shapeSlotList.length; i++) {
                var shapeSlot = page.shapeSlotList[i];
                current = parseFloat(shapeSlot.index);
                if (current > max) {
                    max = current;
                }
            }
        }
        return max + 1;
    }

    /**
     * 页面内增加一个图片槽
     *
     * @param pageSeq   书页顺序
     * @param newImg    新的图片槽位对象
     * @returns {*}
     */
    function insertImageSlot(pageSeq, newImg) {
        newImg = newImg || {};

        var page = getPageBySeq(pageSeq);
        var imageSlotList = page.imageSlotList;

        var name = generateSlotName(slotPrefix.image, imageSlotList);
        var index = generateSlotIndex(pageSeq);

        imageSlotList.push({
            //名称
            name: name,
            //层级
            index: index,

            //宽度
            width: 80,

            //高度
            height: 60,

            //x坐标
            x: ((page.width - 80) / 2),
            //y坐标
            y: ((page.height - 60) / 2),

            //相框id
            slotId : "001",

            //旋转角度
            rotation: 0,

            borderWidth : 0,
            borderColor :"#ffffff",

            //以下是图片框图片信息
            image: null,
            themeImage : null,
            locked: false
        });

        _updateImageSlot(pageSeq, name, newImg);

        return getImageSlotByPageSeqAndName(pageSeq, name);
    }

    function updateImageSlot(pageSeq, name, isSaveToHistory, newImg) {
        if (isSaveToHistory) {
            savePageToHistory(pageSeq);
        }

        _updateImageSlot(pageSeq, name, newImg);
    }

    function _updateImageSlot(pageSeq, name, newImg) {
        var locked = newImg.locked,
            z_index = newImg.index,
            width = newImg.width,
            height = newImg.height,
            x = newImg.x,
            y = newImg.y,
            slotId = newImg.slotId,
            rotation = newImg.rotation,
            borderWidth = newImg.borderWidth,
            borderColor = newImg.borderColor,
            opacity = newImg.opacity,
            image = newImg.image ? {
                id: newImg.image.id,
                fileName: newImg.image.fileName,
                x: newImg.image.x,
                y: newImg.image.y,
                width: newImg.image.width,
                rotation: newImg.image.rotation,
                filter: newImg.image.filter,
                url : newImg.image.url
            } : (newImg.image === null ? null : undefined);

        var imageSlot = getImageSlotByPageSeqAndName(pageSeq, name);

        if (locked !== undefined) {
            imageSlot.locked = locked;
        }
        if (z_index !== undefined) {
            imageSlot.index = parseFloat(z_index);
        }
        if (width !== undefined) {
            imageSlot.width = parseFloat(width);
        }
        if (height !== undefined) {
            imageSlot.height = parseFloat(height);
        }
        if (x !== undefined) {
            imageSlot.x = parseFloat(x);
        }
        if (y !== undefined) {
            imageSlot.y = parseFloat(y);
        }
        if (slotId !== undefined) {
            imageSlot.slotId = slotId;
        }
        if (rotation !== undefined) {
            imageSlot.rotation = parseFloat(rotation);
        }
        if (borderWidth !== undefined) {
            imageSlot.borderWidth = parseFloat(borderWidth);
        }
        if (borderColor !== undefined) {
            imageSlot.borderColor = borderColor;
        }
        if (opacity !== undefined) {
            imageSlot.opacity = opacity;
        }
        if (image !== undefined) {
            if (image !== null) {
                if (imageSlot.image === null) {
                    imageSlot.image = {};
                }
                if (image.id !== undefined) {
                    imageSlot.image.id = image.id;

                    //照片id变了证明替换了照片，这时候如果有有固定照片的信息就清掉
                    imageSlot.themeImage && (imageSlot.themeImage = null);
                }
                if (image.fileName !== undefined) {
                    imageSlot.image.fileName = image.fileName;
                }
                if (image.x !== undefined) {
                    imageSlot.image.x = parseFloat(image.x);
                    imageSlot.themeImage && (imageSlot.themeImage.x = parseFloat(image.x));//这几个是同步修改固定照片信息
                }
                if (image.y !== undefined) {
                    imageSlot.image.y = parseFloat(image.y);
                    imageSlot.themeImage && (imageSlot.themeImage.y = parseFloat(image.y));
                }
                if (image.width !== undefined) {
                    imageSlot.image.width = parseFloat(image.width);
                    imageSlot.themeImage && (imageSlot.themeImage.width = parseFloat(image.width));
                }
                if (image.rotation !== undefined) {
                    imageSlot.image.rotation = parseFloat(image.rotation);
                    imageSlot.themeImage && (imageSlot.themeImage.rotation = parseFloat(image.rotation));
                }
                if (image.filter !== undefined) {
                    imageSlot.image.filter = image.filter;
                }
                if (image.url !== undefined) {
                    imageSlot.image.url = image.url;
                }
            } else {
                imageSlot.image = null;
                //如果有有固定照片的信息就清掉
                imageSlot.themeImage && (imageSlot.themeImage = null);
            }
        }

        //更新变化列表内
        _changedPages[pageSeq] = getPageBySeq(pageSeq);
    }

    function deleteImageSlot(pageSeq, name) {
        var page = getPageBySeq(pageSeq);

        for (var i = 0; i < page.imageSlotList.length; i++) {
            if (page.imageSlotList[i].name.toString() === name.toString()) {

                savePageToHistory(pageSeq);

                page.imageSlotList.splice(i, 1);

                _changedPages[pageSeq] = page;
                return true;
            }
        }
        return false;
    }


    function insertTextSlot(pageSeq, text) {
        text = text || {};

        var page = getPageBySeq(pageSeq);
        var textSlotList = page.textSlotList;

        var name = generateSlotName(slotPrefix.text, textSlotList);
        var index = generateSlotIndex(pageSeq);

        savePageToHistory(pageSeq);

        textSlotList.push({
            //名称
            name: name,
            //层级
            index: index,
            //宽度
            width: 100,
            //高度
            height: 20,
            //x坐标
            x: ((page.width - 100) / 2),
            //y坐标
            y: ((page.height - 20) / 2),
            //文本内容
            content: '',
            //字体大小
            pt: 14,
            //颜色
            color: "#000000",
            //旋转角度
            rotation: 0,
            //字体id
            fontId: (window.globalFontId ? window.globalFontId : "101"),//设置默认字体
            //最大行数 -1代表不限制
            maxLine: -1,
            //最大字数 -1代表不限制
            maxLength: -1,
            //对齐
            align: "left",
            //间距
            space: 0,
            //行距
            leading: -1,

            locked: false
        });

        _updateTextSlot(pageSeq, name, text);

        return getTextSlotByPageSeqAndName(pageSeq, name);
    }

    function updateTextSlot(pageSeq, name, isSaveToHisTory, text) {
        if (isSaveToHisTory) {
            savePageToHistory(pageSeq);
        }

        _updateTextSlot(pageSeq, name, text);
    }

    function _updateTextSlot(pageSeq, name, text) {
        var locked = text.locked,
            z_index = text.index,
            width = text.width,
            height = text.height,
            x = text.x,
            y = text.y,
            content = text.content,
            pt = text.pt,
            color = text.color,
            rotation = text.rotation,
            fontId = text.fontId,
            align = text.align,
            space = text.space,
            leading = text.leading,
            weight = text.weight,
            decoration = text.decoration,
            style = text.style,
            borderWidth = text.borderWidth,
            borderColor = text.borderColor,
            readonly = text.readonly,
            maxLine = text.maxLine,
            maxLength = text.maxLength;

        var textSlot = getTextSlotByPageSeqAndName(pageSeq, name);

        if (readonly !== undefined) {
            textSlot.readonly = readonly;
        }

        if (maxLine !== undefined) {
            textSlot.maxLine = maxLine;
        }

        if (maxLength !== undefined) {
            textSlot.maxLength = maxLength;
        }

        if (locked !== undefined) {
            textSlot.locked = locked;
        }

        if (z_index !== undefined) {
            textSlot.index = parseFloat(z_index);
        }

        if (width !== undefined) {
            textSlot.width = parseFloat(width);
        }

        if (height !== undefined) {
            textSlot.height = parseFloat(height);
        }

        if (x !== undefined) {
            textSlot.x = parseFloat(x);
        }

        if (y !== undefined) {
            textSlot.y = parseFloat(y);
        }

        if (content !== undefined) {
            textSlot.content = content;
        }

        if (pt !== undefined) {
            textSlot.pt = parseFloat(pt);
        }

        if (color !== undefined) {
            textSlot.color = color;
        }

        if (rotation !== undefined) {
            textSlot.rotation = parseFloat(rotation);
        }

        if (fontId !== undefined) {
            textSlot.fontId = fontId;
        }

        if (align !== undefined) {
            textSlot.align = align;
        }

        if (space !== undefined) {
            textSlot.space = parseFloat(space);
        }

        if (leading !== undefined) {
            textSlot.leading = parseFloat(leading);
        }

        if (weight !== undefined) {
            textSlot.weight = weight;
        }

        if (decoration != undefined) {
            textSlot.decoration = decoration;
        }

        if (style != undefined) {
            textSlot.style = style;
        }

        if (borderWidth !== undefined) {
            textSlot.borderWidth = parseFloat(borderWidth);
        }

        if (borderColor !== undefined) {
            textSlot.borderColor = borderColor;
        }

        _changedPages[pageSeq] = getPageBySeq(pageSeq);
    }

    function deleteTextSlot(pageSeq, name) {
        var page = getPageBySeq(pageSeq);

        for (var i = 0; i < page.textSlotList.length; i++) {
            if (page.textSlotList[i].name.toString() === name.toString()) {
                savePageToHistory(pageSeq);

                page.textSlotList.splice(i, 1);

                _changedPages[pageSeq] = page;
                return true;
            }
        }
        return false;
    }


    /**
     * 增加背景底纹槽位
     *
     * @param pageSeq       页面次序
     * @param shadingId     底纹ID
     * @param thumbUrl      缩略图
     * @param editUrl       编辑显示图
     * @param imgWidth      图像宽度
     */
    function addShadingSlot(pageSeq, shadingId, thumbUrl, editUrl, imgWidth) {
        var page = getPageBySeq(pageSeq);

        if (!page.shadingSlotList)
            page.shadingSlotList = [];

        var name = generateSlotName(slotPrefix.shading, page.shadingSlotList);
        if (page.shadingSlotList.length == 0) {
            page.shadingSlotList.push({
                shadingId: shadingId,
                thumbUrl: thumbUrl,
                editUrl: editUrl,
                name: name,
                width: page.width,
                height: page.height,
                rotation: 0,
                index: 0,
                locked: true,
                imgWidth: imgWidth,
                x: 0,
                y: 0
            });
        } else {
            name = page.shadingSlotList[0].name;
            updateShadingSlot(pageSeq, name, true, {
                shadingId: shadingId,
                thumbUrl: thumbUrl,
                editUrl: editUrl,
                imgWidth: imgWidth
            });
        }
    }

    function　updateShadingSlot(pageSeq, name, saveToHistory, obj) {
        if (saveToHistory) {
            savePageToHistory(pageSeq);
        }

        _updateShadingSlot(pageSeq, name, obj);
    }

    function _updateShadingSlot(pageSeq, name, obj) {
        var locked = obj.locked,
            index = obj.index,
            width = obj.width,
            height = obj.height,
            x = obj.x,
            y = obj.y,
            rotation = obj.rotation,
            imgWidth = obj.imgWidth,
            shadingId = obj.shadingId,
            thumbUrl = obj.thumbUrl,
            editUrl = obj.editUrl;

        var shadingbox = getShadingSlotByPageSeqAndName(pageSeq, name);

        if (locked !== undefined) {
            shadingbox.locked = locked;
        }
        if (index !== undefined) {
            shadingbox.index = parseFloat(index);
        }
        if (width !== undefined) {
            shadingbox.width = parseFloat(width);
        }
        if (height !== undefined) {
            shadingbox.height = parseFloat(height);
        }
        if (x !== undefined) {
            shadingbox.x = parseFloat(x);
        }
        if (y !== undefined) {
            shadingbox.y = parseFloat(y);
        }
        if (rotation !== undefined) {
            shadingbox.rotation = rotation;
        }
        if (imgWidth !== undefined) {
            shadingbox.imgWidth = imgWidth;
        }
        if (shadingId !== undefined) {
            shadingbox.shadingId = shadingId;
        }

        if (thumbUrl !== undefined) {
            shadingbox.thumbUrl = thumbUrl;
        }

        if (editUrl !== undefined) {
            shadingbox.editUrl = editUrl;
        }

        _changedPages[pageSeq] = getPageBySeq(pageSeq);
    }

    function insertDecorationSlot(pageSeq, decoration, w, h, x, y) {
        decoration = decoration||{};

        var page = getPageBySeq(pageSeq);

        if (!page.decorationSlotList) {
            page.decorationSlotList = [];
        }
        var decorationSlotList = page.decorationSlotList;

        var name = generateSlotName(slotPrefix.decoration, decorationSlotList);
        var index = generateSlotIndex(pageSeq);

        savePageToHistory(pageSeq);

        var _d = $.extend(true, {}, decoration);

        decorationSlotList.push({
            //配饰的名字
            name:name,

            //层级
            index: index,

            //配饰ID
            decorationId: decoration.id,

            //配饰图像
            src:(decoration.value),

            //旋转角度
            rotation:0,

            //配饰的宽度
            width:w,

            //配饰的高度
            height:h,

            //配饰的位置x
            x: x || ((page.width - 80) / 2),

            //配饰的位置y
            y: y || ((page.height - 60) / 2),

            locked:false
        });

        _d.width = w;
        _d.height = h;

        _updateDecorationSlot(pageSeq, name, _d);

        return getDecorationSlotByPageSeqAndName(pageSeq, name);
    }

    function updateDecorationSlot(pageSeq, name, isSaveToHisTory, decoration) {
        if (isSaveToHisTory) {
            savePageToHistory(pageSeq);
        }

        _updateDecorationSlot(pageSeq, name, decoration);
    }

    function _updateDecorationSlot(pageSeq, name, decoration) {
        var locked = decoration.locked,
            z_index = decoration.index,
            width = decoration.width,
            height = decoration.height,
            x = decoration.x,
            y = decoration.y,
            decorationId = decoration.decorationId,
            rotation = decoration.rotation,
            src = decoration.src;

        var decorationSlot = getDecorationSlotByPageSeqAndName(pageSeq, name);

        if (locked !== undefined){
            decorationSlot.locked = locked;
        }

        if (z_index !== undefined) {
            decorationSlot.index = z_index;
        }

        if (width !== undefined) {
            decorationSlot.width = width;
        }

        if (height !== undefined) {
            decorationSlot.height = height;
        }

        if (x !== undefined) {
            decorationSlot.x = x;
        }

        if (y !== undefined) {
            decorationSlot.y = y;
        }

        if (decorationId !== undefined) {
            decorationSlot.decorationId = decorationId;
        }

        if (rotation !== undefined) {
            decorationSlot.rotation = rotation;
        }

        if (src !== undefined) {
            decorationSlot.src = src;
        }

        _changedPages[pageSeq] = getPageBySeq(pageSeq);
    }

    function deleteDecorationSlot(pageSeq, name) {
        var page = getPageBySeq(pageSeq);

        for (var i = 0; i < page.decorationSlotList.length; i++) {
            if (page.decorationSlotList[i].name.toString() === name.toString()) {
                savePageToHistory(pageSeq);

                page.decorationSlotList.splice(i, 1);

                _changedPages[pageSeq] = page;
                return true;
            }
        }
        return false;
    }

    function insertShapeSlot(pageSeq, shape) {
        shape = shape || {};

        var page = getPageBySeq(pageSeq);

        if (!page.shapeSlotList) {
            page.shapeSlotList = [];
        }
        var shapeSlotList = page.shapeSlotList;

        var name = generateSlotName(slotPrefix.shape, shapeSlotList);
        var index = generateSlotIndex(pageSeq);

        savePageToHistory(pageSeq);

        shapeSlotList.push({
            //形状的名字
            name: name,

            //层级
            index: index,

            //形状ID
            slotId: '301',

            shapeId: shape.id,

            //旋转角度
            rotation: 0,

            //形状的宽度
            width: shape.w||25,

            //形状的高度
            height: shape.h || 25,

            //形状的颜色
            color: shape.color || '#2db572',

            //形状的边框width
            borderWidth: shape.borderWidth,

            //形状的边框color
            borderColor: shape.borderColor,

            //形状的透明度
            opacity:shape.opacity,

            //挂件的位置x
            x: ((page.width - 80) / 2),

            //挂件的位置y
            y: ((page.height - 60) / 2),

            locked: false
        });

        _updateShapeSlot(pageSeq, name, shape);

        return getShapeSlotByPageSeqAndName(pageSeq, name);
    }

    function updateShapeSlot(pageSeq, name, isSaveToHisTory, shape) {
        if (isSaveToHisTory) {
            savePageToHistory(pageSeq);
        }

        _updateShapeSlot(pageSeq, name, shape);
    }

    function _updateShapeSlot(pageSeq, name, shape) {
        var locked = shape.locked,
            z_index = shape.index,
            width = shape.width,
            height = shape.height,
            x = shape.x,
            y = shape.y,
            slotId = shape.slotId,
            shapeId = shape.shapeId,
            rotation = shape.rotation,
            color = shape.color,
            borderWidth = shape.borderWidth,
            borderColor = shape.borderColor,
            opacity = shape.opacity;

        var shapeSlot = getShapeSlotByPageSeqAndName(pageSeq, name);

        if (locked !== undefined) {
            shapeSlot.locked = locked;
        }

        if (z_index !== undefined) {
            shapeSlot.index = z_index;
        }

        if (width !== undefined) {
            shapeSlot.width = width;
        }

        if (height !== undefined) {
            shapeSlot.height = height;
        }

        if (x !== undefined) {
            shapeSlot.x = x;
        }

        if (y !== undefined) {
            shapeSlot.y = y;
        }

        if (slotId !== undefined) {
            shapeSlot.slotId = slotId;
        }

        if (shapeId !== undefined) {
            shapeSlot.shapeId = shapeId;
        }

        if (rotation !== undefined) {
            shapeSlot.rotation = rotation;
        }

        if (opacity !== undefined) {
            shapeSlot.opacity = opacity;
        }

        if (borderWidth !== undefined) {
            shapeSlot.borderWidth = borderWidth;
        }

        if (borderColor !== undefined) {
            shapeSlot.borderColor = borderColor;
        }

        if (color !== undefined) {
            shapeSlot.color = color;
        }

        _changedPages[pageSeq] = getPageBySeq(pageSeq);
    }

    function deleteShapeSlot(pageSeq, name) {
        var page = getPageBySeq(pageSeq);

        for (var i = 0; i < page.shapeSlotList.length; i++) {
            if (page.shapeSlotList[i].name.toString() === name.toString()) {
                savePageToHistory(pageSeq);

                page.shapeSlotList.splice(i, 1);

                _changedPages[pageSeq] = page;
                return true;
            }
        }
        return false;
    }

    /**
     * 替换页面
     *
     * @param page
     * @returns {boolean}
     */
    function replacePage(page) {
        savePageToHistory(page.seq);

        if (page.seq === 'front-cover') {
            _book.cover = page;
            return true;
        } else if (page.seq === 'spine') {
            _book.spine = page;
            return true;
        } else if (page.seq === 'front-flap') {
            _book.frontFlap = page;
            return true;
        } else if (page.seq === 'back-flap') {
            _book.backFlap = page;
            return true;
        } else if (page.seq === "flyleaf") {
            _book.flyleaf = page;
            return true;
        } else if (page.seq === 'copyright') {
            _book.copyright = page;
            return true;
        }  else if (page.seq === 'back-cover') {
            _book.backCover = page;
            return true;
        } else {
            for (var i = 0; i < _book.innerPage.length; i++) {
                if (_book.innerPage[i].seq.toString() === page.seq.toString()) {
                    _book.innerPage[i] = page;
                    return true;
                }
            }
        }

        _changedPages[page.seq] = page;
        return false;
    }

    function undo(pageSeq) {
        var pageJSONStr = _historys[pageSeq].pop(),
            page = getPageBySeq(pageSeq);

        if (!pageJSONStr) {
            return null;
        }

        if (!_undoHistorys[pageSeq]) {
            _undoHistorys[pageSeq] = [];
        }
        _undoHistorys[pageSeq].push(JSON.stringify(page));

        var pageinfo = JSON.parse(pageJSONStr);

        if (pageSeq === 'front-cover') {
            _book.cover = pageinfo;
        } else if (pageSeq === 'spine') {
            _book.spine = pageinfo;
        } else if (pageSeq === 'front-flap') {
            _book.frontFlap = pageinfo;
        } else if (pageSeq === 'back-flap') {
            _book.backFlap = pageinfo;
        } else if (pageSeq === 'flyleaf') {
            _book.flyleaf = pageinfo;
        }  else if (pageSeq === 'back-cover') {
            _book.backCover = pageinfo;
        } else {
            for (var i = 0; i < _book.innerPage.length; i++) {
                if (_book.innerPage[i].seq.toString() === pageSeq.toString()) {
                    _book.innerPage[i] = pageinfo;
                }
            }
        }

        _changedPages[pageSeq] = pageinfo;

        return pageinfo;
    }

    function redo(pageSeq) {
        var pageJSONStr = _undoHistorys[pageSeq].pop(),
            page = getPageBySeq(pageSeq);

        if (!pageJSONStr) {
            return null;
        }

        _historys[pageSeq].push(JSON.stringify(page));

        var pageinfo = JSON.parse(pageJSONStr);

        if (pageSeq === 'front-cover') {
            _book.cover = pageinfo;
        } else if (pageSeq === 'spine') {
            _book.spine = pageinfo;
        } else if (pageSeq === 'front-flap') {
            _book.frontFlap = pageinfo;
        } else if (pageSeq === 'back-flap') {
            _book.backFlap = pageinfo;
        } else if (pageSeq === 'flyleaf') {
            _book.flyleaf = pageinfo;
        } else if (pageSeq === 'back-cover') {
            _book.backCover = pageinfo;
        } else {
            for (var i = 0; i < _book.innerPage.length; i++) {
                if (_book.innerPage[i].seq.toString() === pageSeq.toString()) {
                    _book.innerPage[i] = pageinfo;
                }
            }
        }

        _changedPages[pageSeq] = pageinfo;

        return pageinfo;
    }

    function getHistoryLength(pageSeq) {
        if (!_historys[pageSeq]) {
            _historys[pageSeq] = [];
        }
        return _historys[pageSeq].length;
    }

    function getUndoHistoryLength(pageSeq) {
        if (!_undoHistorys[pageSeq]) {
            _undoHistorys[pageSeq] = [];
        }
        return _undoHistorys[pageSeq].length;
    }


    function removeSlots(slots) {
        var pageSeqs = [];

        slots.forEach(function (slotInfo) {
            if (!pageSeqs.some(function (pageSeq) {
                    return pageSeq === slotInfo.pageSeq;
                }))
                pageSeqs.push(slotInfo.pageSeq);
        });

        pageSeqs.forEach(function (pageSeq) {
            savePageToHistory(pageSeq);
        });

        slots.forEach(function (slotInfo) {
            var seq = slotInfo.pageSeq;
            var name = slotInfo.name;
            var type = slotInfo.type;

            var page = getPageBySeq(seq);

            switch(type) {
                case slotType.image:
                    page.imageSlotList.remove(function (slot) {
                        return slot.name === name;
                    });
                    break;
                case slotType.decoration:
                    page.decorationSlotList.remove(function (slot) {
                        return slot.name === name;
                    });
                    break;
                case slotType.shape:
                    page.shapeSlotList.remove(function (slot) {
                        return slot.name === name;
                    });
                    break;
                case slotType.text:
                    page.textSlotList.remove(function (slot) {
                        return slot.name === name;
                    });
                    break;
                case slotType.shading:
                    page.shadingSlotList.remove(function (slot) {
                        return slot.name === name;
                    });
                    break;
            }
        });
    }

    function slotPositionExist(pageSeq, x, y) {
        var page = getPageBySeq(pageSeq);

        var i;

        if (page.imageSlotList) {
            for (i = 0; i < page.imageSlotList.length; i++) {
                if (page.imageSlotList[i].x === x && page.imageSlotList[i].y === y)
                    return true;
            }
        }

        if (page.textSlotList) {
            for (i = 0; i < page.textSlotList.length; i++) {
                if (page.textSlotList[i].x === x && page.textSlotList[i].y === y)
                    return true;
            }
        }

        if (page.decorationSlotList) {
            for (i = 0; i < page.decorationSlotList.length; i++) {
                if (page.decorationSlotList[i].x === x && page.decorationSlotList[i].y === y)
                    return true;
            }
        }

        if (page.shapeSlotList) {
            for (i = 0; i < page.shapeSlotList.length; i++) {
                if (page.shapeSlotList[i].x === x && page.shapeSlotList[i].y === y)
                    return true;
            }
        }

        return false;
    }


    // 粘贴框框
    function pasteSlots(destPageSeq, pasteX, pasteY) {
        if (['spine'].contains(destPageSeq))
            return;

        if (exports.slotsClipboard.length === 0)
            return;

        var page = getPageBySeq(destPageSeq);

        var startIndex = generateSlotIndex(destPageSeq);

        savePageToHistory(destPageSeq);

        var plusX = true;
        var plusY = true;

        var process = function (slot, boxInfo) {
            if (pasteX !== undefined && pasteY !== undefined) {
                slot.x = pasteX - slot.width / 2;
                slot.y = pasteY - slot.height / 2;
            }

            while(slotPositionExist(destPageSeq, slot.x, slot.y)) {
                var x, y;

                if (plusX)
                    x = parseFloat(slot.x) + 10;
                else
                    x = parseFloat(slot.x) - 10;

                if (plusY)
                    y = parseFloat(slot.y) + 10;
                else
                    y = parseFloat(slot.y) - 10;

                if (x + slot.width / 2 > page.width || x + slot.width / 2 < 0) {
                    plusX = !plusX;
                    continue;
                }
                if (y + slot.height / 2 > page.height || y + slot.height / 2 < 0) {
                    plusY = !plusY;
                    continue;
                }

                slot.x = x;
                slot.y = y;
            }
            slot.index += startIndex;
            slot.locked = false;
        };

        var slot;

        exports.slotsClipboard.forEach(function (slotInfo) {
            slot = JSON.parse(JSON.stringify(slotInfo.slot));
            switch(slotInfo.type) {
                case 'imageslot':
                    if (!page.imageSlotList)
                        page.imageSlotList = [];
                    slot.name = generateSlotName(slotPrefix.image, page.imageSlotList);
                    process(slot, slotInfo);
                    page.imageSlotList.push(slot);
                    break;
                case 'decorationslot':
                    if (!page.decorationSlotList)
                        page.decorationSlotList = [];
                    slot.name = generateSlotName(slotPrefix.decoration, page.decorationSlotList);
                    process(slot, slotInfo);
                    page.decorationSlotList.push(slot);
                    break;
                case 'shapeslot':
                    if (!page.shapeSlotList)
                        page.shapeSlotList = [];
                    slot.name = generateSlotName(slotPrefix.shape, page.shapeSlotList);
                    process(slot, slotInfo);
                    page.shapeSlotList.push(slot);
                    break;
                case 'textslot':
                    if (!page.textSlotList)
                        page.textSlotList = [];
                    slot.name = generateSlotName(slotPrefix.text, page.textSlotList);
                    process(slot, slotInfo);
                    page.textSlotList.push(slot);
                    break;
                case 'shadingslot':
                    if (!page.shadingSlotList)
                        page.shadingSlotList = [];
                    slot.name = generateSlotName(slotPrefix.shading, page.shadingSlotList);
                    process(slot, slotInfo);
                    page.shadingSlotList.push(slot);
                    break;
            }
        });

        return slot;
    }

    function clearPage(seq) {
        var page = getPageBySeq(seq);

        savePageToHistory(seq);

        page.imageSlotList = getReadonly(page.imageSlotList);
        page.textSlotList = getReadonly(page.textSlotList);
        page.shapeSlotList = getReadonly(page.shapeSlotList);
        page.decorationSlotList = getReadonly(page.decorationSlotList);
        page.shadingSlotList = getReadonly(page.shadingSlotList);
    }

    function addNewEmptyPage(num, postion, curSeq) {
        num = parseInt(num);
        if (num % 2 == 1) {
            num += 1;
        }

        var pageTemp = {
            name : "empty",
            width : _book.width,
            height : _book.height,
            imageSlotList : [],
            textSlotList : [],
            shapeSlotList : [],
            decorationSlotList : [],
            shadingSlotList : []
        };
        pageTemp.type = "normal";

        var innerPageLength = _book.innerPage.length;
        curSeq = parseInt(curSeq);
        if (curSeq % 2 == 0) {
            curSeq += 1;
        }

        switch (postion) {
            case "front" :
                if (curSeq > 0) {
                    curSeq = curSeq - 1;
                }
                for (var i = 0; i < num; i ++) {
                    _book.innerPage.splice(curSeq, 0, generateNewPage(innerPageLength + i, "add", "normal", pageTemp, false));
                }
                break;
            case "behind" :
                if (curSeq < innerPageLength) {
                    curSeq = curSeq + 1;
                }
                for (var i = 0; i < num; i ++) {
                    _book.innerPage.splice(curSeq, 0, generateNewPage(innerPageLength + i, "add", "normal", pageTemp, false));
                }
                break;
            case "last" :
                for (var i = 0; i < num; i ++)
                    _book.innerPage.push(generateNewPage(innerPageLength + i, "add", "normal", pageTemp, false));
                break;
            case "first" :
                for (var i = 0; i < num; i ++)
                    _book.innerPage.unshift(generateNewPage(innerPageLength + i, "add", "normal", pageTemp, false));
                break;
        }

        initSort();
    }

    function generateNewPage(seq, namespace, pageType, pageTemplate, isFixImageTheme) {
        return {
            seq : seq.toString(),
            name: (namespace + '.' + pageTemplate.name),
            width: pageTemplate.width,
            height: pageTemplate.height,
            imageSlotList: (function () {
                var imageSlotList = [];
                for (var i = 0; i < pageTemplate.imageSlotList.length; i++) {
                    //如果是固定照片的主题且是封面就用新的获取数据
                    var newImageSlot;
                    if (isFixImageTheme && pageType == 3) {
                        newImageSlot = generateNewImageSlotFixImage(pageTemplate.imageSlotList[i]);
                    } else {
                        newImageSlot = generateNewImageSlot(pageTemplate.imageSlotList[i]);
                    }
                    imageSlotList.push(newImageSlot);
                }
                return imageSlotList;
            })(),
            textSlotList: (function () {
                var textSlotList = [];
                for (var i = 0; i < pageTemplate.textSlotList.length; i++) {
                    var newTextSlot = generateNewTextSlot(pageTemplate.textSlotList[i]);
                    textSlotList.push(newTextSlot);
                }
                return textSlotList;
            })(),
            shapeSlotList: (function (){
                var shapeSlotList = [];
                if (pageTemplate.shapeBoxList == undefined)
                    return shapeSlotList;
                for (var i = 0; i < pageTemplate.shapeSlotList.length; i++) {
                    var newShape = generateNewShapeSlot(pageTemplate.shapeSlotList[i]);
                    shapeSlotList.push(newShape);
                }
                return shapeSlotList;
            })(),
            decorationSlotList: (function () {
                var decorationSlotList = [];
                if (pageTemplate.decorationSlotList == undefined)
                    return decorationSlotList;
                for (var i = 0; i < pageTemplate.decorationSlotList.length; i++) {
                    var newDecoration = generateNewDecorationSlot(pageTemplate.decorationSlotList[i]);
                    decorationSlotList.push(newDecoration);
                }
                return decorationSlotList;
            })(),
            shadingSlotList: (function () {
                var shadingSlotList = [];
                if (pageTemplate.shadingSlotList == undefined)
                    return shadingSlotList;
                for (var i = 0; i < pageTemplate.shadingSlotList.length; i++) {
                    var newShading = generateNewShadingSlot(pageTemplate.shadingSlotList[i]);
                    shadingSlotList.push(newShading);
                }
                return shadingSlotList;
            })(),
            backgroundColor: pageTemplate.backgroundColor || "#fff",
            type: pageType
        };
    }

    function generateNewTextSlot(textSlotTpl) {
        return {
            name: textSlotTpl.name,
            index: textSlotTpl.index == undefined ? 1 : textSlotTpl.index,
            width: textSlotTpl.width,
            height: textSlotTpl.height,
            x: textSlotTpl.x,
            y: textSlotTpl.y,
            rotation: textSlotTpl.rotation == undefined ? 0 : textSlotTpl.rotation,
            content: textSlotTpl.content == undefined ? "" : textSlotTpl.content,
            pt: textSlotTpl.pt,
            color: textSlotTpl.color,
            fontId: textSlotTpl.fontId || "101",
            align: textSlotTpl.align,
            space: textSlotTpl.space,
            leading: textSlotTpl.leading || -1,
            opacity: textSlotTpl.opacity || 1,
            locked : textSlotTpl.locked == undefined ? false : textSlotTpl.locked
        };
    }

    function generateNewImageSlot(imageSlotTpl) {
        return {
            name: imageSlotTpl.name,
            index: imageSlotTpl.index == undefined ? 1 : imageSlotTpl.index,
            width: imageSlotTpl.width,
            height: imageSlotTpl.height,
            x: imageSlotTpl.x,
            y: imageSlotTpl.y,
            rotation: imageSlotTpl.rotation == undefined ? 0 : imageSlotTpl.rotation,
            borderWidth: imageSlotTpl.borderWidth || 0,
            borderColor: imageSlotTpl.borderColor || '#ffffff',
            slotId: imageSlotTpl.slotId || null,
            image: null,
            locked : imageSlotTpl.locked == undefined ? false : imageSlotTpl.locked
        };
    }

    //保留照片信息的
    function generateNewImageSlotFixImage(imageSlotTpl) {
        return {
            name: imageSlotTpl.name,
            index: imageSlotTpl.index == undefined ? 1 : imageSlotTpl.index,
            width: imageSlotTpl.width,
            height: imageSlotTpl.height,
            x: imageSlotTpl.x,
            y: imageSlotTpl.y,
            rotation: imageSlotTpl.rotation == undefined ? 0 : imageSlotTpl.rotation,
            borderWidth: imageSlotTpl.borderWidth || 0,
            borderColor: imageSlotTpl.borderColor || '#ffffff',
            slotId: imageSlotTpl.slotId || null,
            image: imageSlotTpl.image || null,
            themeImage: imageSlotTpl.themeImage || null,
            locked : imageSlotTpl.locked == undefined ? false : imageSlotTpl.locked
        };
    }

    function generateNewShapeSlot(shapeSlot) {
        return {
            border_color: shapeSlot.border_color,
            border_width: shapeSlot.border_width,
            color: shapeSlot.color,
            color_id: shapeSlot.color_id,
            height: shapeSlot.height,
            index: shapeSlot.index == undefined ? 1 : shapeSlot.index,
            name: shapeSlot.name,
            opacity: shapeSlot.opacity,
            rotation: shapeSlot.rotation == undefined ? 0 : shapeSlot.rotation,
            width: shapeSlot.width,
            x: shapeSlot.x,
            y: shapeSlot.y,
            locked : shapeSlot.locked == undefined ? false : shapeSlot.locked
        };
    }

    function generateNewDecorationSlot(decorationSlotTpl) {
        return {
            decorationId: decorationSlotTpl.decorationId,
            height: decorationSlotTpl.height,
            index: decorationSlotTpl.index == undefined ? 1 : decorationSlotTpl.index,
            locked: false,
            name: decorationSlotTpl.name,
            rotation: decorationSlotTpl.rotation == undefined ? 0 : decorationSlotTpl.rotation,
            src: decorationSlotTpl.src,
            width: decorationSlotTpl.width,
            x: decorationSlotTpl.x,
            y: decorationSlotTpl.y
        }
    }

    function generateNewShadingSlot(shadingSlotTpl) {
        return {
            shadingId: shadingSlotTpl.shadingId,
            height: shadingSlotTpl.height,
            index: shadingSlotTpl.index == undefined ? 1 : shadingSlotTpl.index,
            locked: false,
            name: shadingSlotTpl.name,
            imgWidth: shadingSlotTpl.imgWidth,
            rotation: shadingSlotTpl.rotation == undefined ? 0 : shadingSlotTpl.rotation,
            width: shadingSlotTpl.width,
            x: shadingSlotTpl.x,
            y: shadingSlotTpl.y,
            editUrl: shadingSlotTpl.editUrl,
            thumbUrl: shadingSlotTpl.thumbUrl
        }
    }


    /**
     * 保存页面到历史记录内，
     * 可以用于还原撤销操作
     *
     * @param pageSeq   页面
     */
    function savePageToHistory(pageSeq) {
        if (!_historys[pageSeq]) {
            _historys[pageSeq] = [];
        }

        _historys[pageSeq].push(JSON.stringify(getPageBySeq(pageSeq)));

        _undoHistorys[pageSeq] = [];
    }

    /**
     * 获取列表内属性为只读的槽位
     * @param list
     * @returns {Array}
     */
    function getReadonly(list) {
        var slotList = [];
        for (var i = 0; i < list.length; i++){
            var readonly = list[i].readonly;
            if (readonly == true) {
                slotList.push(list[i]);
            }
        }
        return slotList;
    }

    function sortPages(sortData) {
        var pages = {};
        for (var key in sortData) {
            pages[key] = getPageBySeq(key.toString());
        }

        for (key in pages) {
            pages[key].seq = sortData[key].toString();
        }

        _book.innerPage.sort(function (a, b) {
            return a.seq - b.seq;
        });

        for (key in pages) {
            _changedPages[key] = pages[key];
        }
    }

    function delPages(pageSeqs) {
        var nextPageSeq = null;
        $.each(pageSeqs,  function(i, seq) {
            for (var i = 0; i < _book.innerPage.length; i ++) {
                if (seq.toString() == _book.innerPage[i].seq.toString()) {
                    _book.innerPage.splice(i, 1);
                    if (nextPageSeq == null)
                        nextPageSeq = i - 1;
                }
            }
        });

        initSort();
        saveChanges();
        if (nextPageSeq < 0)
            return 0;
        else if (nextPageSeq < _book.innerPage.length - 1) {
            return nextPageSeq + 1;
        } else {
            return 'back-cover';
        }
    }

    function addPages(num, postion, curSeq) {
        addNewEmptyPage(num, postion, curSeq);
        saveChanges();
    }

    function initSort() {
        for (var i = 0; i < _book.innerPage.length; i ++) {
            _book.innerPage[i].seq = "" + i;
        }
    }

    function updatePage(pageSeq, obj, saveToHistory) {
        if (saveToHistory === true) {
            savePageToHistory(pageSeq);
        }
        _updatePage(pageSeq, obj);
    }



    function _updatePage(pageSeq, obj) {
        var backgroundColor = obj.backgroundColor;

        var page = getPageBySeq(pageSeq);

        if (!page) {
            return;
        }

        if (backgroundColor !== undefined) {
            page.backgroundColor = backgroundColor;
        }

        _changedPages[page.seq] = page;
    }

    function exchangePages(pageSeq1, pageSeq2) {
        var pages1 = [], pages2 = [];

        for (var i = 0; i < Math.max(pageSeq1.length, pageNums2.length) ; i++) {
            pages1.push(getPageBySeq(parseFloat(pageSeq1[0]) + i));
            pages2.push(getPageBySeq(parseFloat(pageSeq2[0]) + i));
        }

        for (i = 0; i < Math.max(pageSeq1.length, pageSeq2.length) ; i++) {
            pages1[i].seq = (parseFloat(pageSeq2[0]) + i).toString();
            pages2[i].seq = (parseFloat(pageSeq1[0]) + i).toString();
        }

        _book.innerPage.sort(function (a, b) {
            return a.seq - b.seq;
        });

        for (i = 0; i < pages1.length; i++) {
            _changedPages[pages1[i].seq] = pages1[i];
        }
        for (i = 0; i < pages2.length; i++) {
            _changedPages[pages2[i].seq] = pages2[i];
        }
    }

    // 有图就算完成
    function computeCompletedPagePercent() {
        var innerPage = _book.innerPage;
        var i;

        var completePageCount = 0;

        for (i = 0; i < innerPage.length; i++) {
            if (!innerPage[i].imageSlotList || !innerPage[i].imageSlotList.length ||
                innerPage[i].imageSlotList.some(function (imgSlot) {
                    return imgSlot.image;
                })) {
                if (innerPage[i].type === 2)
                    completePageCount += 2;
                else
                    completePageCount += 1;
            }
        }

        return completePageCount / innerPage.length;
    }

    function computeCompletedPercent() {
        var allPages = getAllPages(false);

        var i, j, k, curPage, curImgSlot, curTextSlot,isCross,
            imgCount, textCount, decorationCount, shapeCount;

        var completePageCount = 0;

        for (i = 0; i < allPages.length; i++) {
            curPage = allPages[i];

            if (curPage.num == "spine" ) {
                completePageCount++; continue;
            }

            if (isCross) { isCross = false; completePageCount++; continue; }
            isCross = curPage.type == 2;

            imgCount = curPage.imageSlotList.length;
            textCount = curPage.textSlotList.length;
            decorationCount = curPage.decorationSlotList ? curPage.decorationSlotList.length : 0;
            shapeCount = curPage.shapeSlotList ? curPage.shapeSlotList.length : 0;

            for (j = 0; j < imgCount; j++) {
                curImgSlot = curPage.imageSlotList[j];
                if (curImgSlot.name == "imglogo") { continue; }
                if (!curImgSlot || !curImgSlot.image || !curImgSlot.image.id) {
                    break;
                }
            }
            if (j != 0 && j === imgCount) {
                completePageCount++;
            }
            //没有图片时，算页面的文本有没有填充
            if (imgCount == 0) {
                for (k = 0; k < textCount; k++) {
                    curTextSlot = curPage.textSlotList[k];
                    if (!curTextSlot || curTextSlot.content=="" || curTextSlot.content==null) {
                        break;
                    }
                }
                if (k != 0 && k === textCount) {
                    completePageCount++;
                } else if (curPage.decorationSlotList && decorationCount > 0) {
                    completePageCount++;
                } else if (curPage.shapeSlotList && shapeCount > 0) {
                    completePageCount++;
                }
            }
            if (0 === imgCount && 0 === textCount && 0 === decorationCount && 0 === shapeCount) {
                completePageCount++;
            }
        }

        return completePageCount / allPages.length;
    }

    var toGeneratePreviewPageDatas = [];

    function saveChanges(onSuccess, onError) {

        toGeneratePreviewPageDatas = [];

        //var arr = localDB.getBookData(_workId);
        //arr = arr.length == 1 ? [, , 0] : arr;
        //var compParcent = computeCompletedParcent();

        var judge = function (pageSeq, pageData) {
            for (var i = 0; i < pageData.imageSlotList.length; i++) {
                var photo = null, imgSlot = pageData.imageSlotList[i];
                if (imgSlot.image && imgSlot.image.id) {
                    photo = model.photo.getById(imgSlot.image.id);
                    //if (!photo || !photo.isComplete) {
                    //    break;
                    //}
                }
            }

            if (i === pageData.imageSlotList.length) {
                if (!toGeneratePreviewPageDatas.contains(function (item) { return item.num === pageData.num; })) {
                    $.inArray(pageData, toGeneratePreviewPageDatas) == -1 && toGeneratePreviewPageDatas.push(pageData);
                }
            } else {
                _generatePreviewQueue[pageSeq] = pageData;
            }
        };

        //保存封面&&带折页
        $.each(_changedPages, function () {
            if (this.seq == "front-cover") {
                _changedPages["front-flap"] = getPageBySeq("front-flap");
            }
        });

        for (var key in _changedPages) {
            var pageData = _changedPages[key] == "" ? null : _changedPages[key];
            delete _changedPages[key];
            if(pageData == null) continue;
            judge(key, pageData);
        }
        for (var key in _toGeneratePreviewPages) {
            var pageData = _toGeneratePreviewPages[key];
            delete _toGeneratePreviewPages[key];
            judge(key, pageData);
        }
        for (var key in _generatePreviewQueue) {
            var pageData = _generatePreviewQueue[key];
            delete _generatePreviewQueue[key];
            judge(key, pageData);
        }

        var checkUploaded = function (imgSlot) {
            if (!imgSlot.image)
                return;
            var photo = model.photo.getById(imgSlot.image.id);
            if (photo) {
                imgSlot.image.uploaded = true;
            }
        };

        _book.cover && _book.cover.imageSlotList && _book.cover.imageSlotList.forEach(checkUploaded);
        _book.flyleaf && _book.flyleaf.imageSlotList && _book.flyleaf.imageSlotList.forEach(checkUploaded);
        _book.frontFlap && _book.frontFlap.imageSlotList && _book.frontFlap.imageSlotList.forEach(checkUploaded);
        _book.innerPage && _book.innerPage.forEach(function (page) {
            page.imageSlotList && page.imageSlotList.forEach(checkUploaded);
        });
        _book.copyright && _book.copyright.imageSlotList && _book.copyright.imageSlotList.forEach(checkUploaded);

        SureAjax.ajax({
            url: "/api/book/info/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(model.book.getBookInfo()),
            success: function(data) {
                if (typeof onSuccess == 'function') {
                    onSuccess.call(exports, data);
                }
            },
             error : function(e) {
                 onError.call(exports, e);
             }
        });


        //if (compParcent >= arr[2]) {//完成率大于久的版本才可以保存到本地防止丢失
        //    localDB.setBookData(_workId, _book);
        //    console.log("完成率大于久的版本，保存到了本地");
        //} else {
        //    console.log("完成率低于久的版本，不保存到了本地");
        //}
        //printLog(toGeneratePreviewPageDatas, "num");
        //
        //var currentPages = window.currentPageNums.map(function (pageSeq) {
        //    return getPageBySeq(pageSeq)
        //});
        //
        //
        //$.post('/editor/GeneratePreview', {
        //    workId: _workId,
        //    userId: _userId,
        //    compressedPageDataStr: LZString.compressToBase64(JSON.stringify(currentPages))
        //});
    }

    function saveMyTemplate(pageSeq, cb) {
        var getPage = getPageBySeq(pageSeq);
        Api.template.addPageTemplate(getPageTemplateFromPage(getPage), function(data) {
            if (typeof cb == 'function') {
                cb(data);
            }
        })
    }

    function getPageTemplateFromPage(page) {
        var pt = {};

        pt.name = page.name;
        pt.width = page.width;
        pt.height = page.height;
        pt.type = page.type;
        pt.level = "U";
        pt.tplId = _bookId

        pt.resource = filterPageXml(page);

        return pt;
    }

    function filterPageXml(pageRes){

        var page = {};
        $.extend(true, page, pageRes);

        if (page.imageSlotList !== null && page.imageSlotList !== undefined) {
            for (var i = 0; i < page.imageSlotList.length; i++) {
                var img = page.imageSlotList[i];
                if (img.image) {
                    img.image = null;
                }
            }
        }
        if (page.textSlotList !== null && page.textSlotList !== undefined) {
            for (var i = 0; i < page.textSlotList.length; i++) {
                var text = page.textSlotList[i];
                text.content = "";
            }
        }
        if (page.shapeSlotList !== null && page.shapeSlotList !== undefined) {
            for (var i = 0; i < page.shapeSlotList.length; i++) {
                var colorBoxs = page.shapeSlotList[i];
                if (colorBoxs.borderColor == "" || colorBoxs.borderColor == null) {
                    colorBoxs.borderColor = "#ffffff";
                }
            }
        }
        if (page.decorationSlotList !== null || page.decorationSlotList !== undefined) {
            page.decorationSlotList = null;
        }

        return page;
    }

    function generateThumb(pageSeq, onComplate) {
        if (pageSeq == undefined || pageSeq == "all") {
            var allPages = getAllPages(true);
            var pageNums = allPages.length;
            var curIndex = 0;

            var judgeIsEnd = function () {
                if (curIndex < pageNums) {
                    SureMsg.updateLoadBar("已完成[" + curIndex + "/"  + pageNums + "]");
                    processOnePage();
                } else if (curIndex === pageNums) {
                    if (typeof onComplate === 'function') {
                        onComplate.call(exports);
                    }
                }
            };

            var processOnePage = function() {
                var page = allPages[curIndex];
                generateThumb(page.seq, function() {
                    curIndex ++;
                    judgeIsEnd();
                });
            };

            judgeIsEnd();

        } else {
            var pageInfo = getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(pageSeq);
            canvas.generateThumbnail(pageInfo, photos, function(e) {
                var ir = e.ir;
                updateThumbnail(pageSeq, ir.src);

                if (typeof onComplate == 'function') {
                    onComplate.call(exports);
                }
            }, 108);
        }

    }


    exports.init = init;
    exports.getBookInfo = getBookInfo;
    exports.get = get;
    exports.update = update;
    exports.publish = publish;
    exports.updateThumbnail = updateThumbnail;
    exports.getBookId = getBookId;
    exports.getUserId = getUserId;
    exports.getAllPages = getAllPages;
    exports.getPageBySeq = getPageBySeq;

    exports.getImageSlotByPageSeqAndName = getImageSlotByPageSeqAndName;
    exports.getTextSlotByPageSeqAndName = getTextSlotByPageSeqAndName;
    exports.getShapeSlotByPageSeqAndName = getShapeSlotByPageSeqAndName;
    exports.getDecorationSlotByPageSeqAndName = getDecorationSlotByPageSeqAndName;
    exports.getShadingSlotByPageSeqAndName = getShadingSlotByPageSeqAndName;

    exports.insertImageSlot = insertImageSlot;
    exports.updateImageSlot = updateImageSlot;
    exports.deleteImageSlot = deleteImageSlot;

    exports.insertTextSlot = insertTextSlot;
    exports.updateTextSlot = updateTextSlot;
    exports.deleteTextSlot = deleteTextSlot;

    exports.addShadingSlot = addShadingSlot;
    exports.updateShadingSlot = updateShadingSlot;

    exports.insertDecorationSlot = insertDecorationSlot;
    exports.updateDecorationSlot = updateDecorationSlot;
    exports.deleteDecorationSlot = deleteDecorationSlot;

    exports.insertShapeSlot = insertShapeSlot;
    exports.updateShapeSlot = updateShapeSlot;
    exports.deleteShapeSlot = deleteShapeSlot;

    exports.replacePage = replacePage;
    exports.sortPages = sortPages;
    exports.exchangePages = exchangePages;
    exports.updatePage = updatePage;

    exports.undo = undo;
    exports.redo = redo;
    exports.getHistoryLength = getHistoryLength;
    exports.getUndoHistoryLength = getUndoHistoryLength;
    exports.removeSlots = removeSlots;
    exports.pasteSlots = pasteSlots;
    exports.slotsClipboard = [];
    exports.clearPage = clearPage;
    exports.saveChanges = saveChanges;

    exports.generateNewPage = generateNewPage;
    exports.addNewEmptyPage = addNewEmptyPage;
    exports.generateNewImageSlot = generateNewImageSlot;
    exports.generateNewImageSlotFixImage = generateNewImageSlotFixImage;
    exports.generateNewShadingSlot = generateNewShadingSlot;
    exports.generateNewDecorationSlot = generateNewDecorationSlot;
    exports.generateNewShapeSlot = generateNewShapeSlot;
    exports.generateNewTextSlot = generateNewTextSlot;

    exports.computeCompletedPercent = computeCompletedPercent;
    exports.computeCompletedPagePercent = computeCompletedPagePercent;

    exports.initSort = initSort;

    exports.saveMyTemplate = saveMyTemplate;

    exports.generateThumb = generateThumb;

    exports.delPages = delPages;
    exports.addPages = addPages;

    exports.slotsClipboard = [];
});
define('leftTemplate',['event','canvas','pageUtil','size-converter'], function(require, exports, module)  {

    var Event = require('event');
    var canvasUtil = require('canvas');
    var pageUtil = require('pageUtil');
    var SizeConverter = require('size-converter');
    var sizeConverter = new SizeConverter(108);


    var $lefTemplateMain = $('#left-template-main');
    var $leftTemplateList = $('#left-template-list');

    function init() {
        $('#left-template-main select').chosen({
            placeholder_text : "请选择",
            no_results_text : "无",
            disable_search : true
        });

        initAdminTemplateList();
    }

    function initTemplateList($list, tpls) {

        var t = $('#left-template-item').html();
        $.each(tpls, function(i, tpl) {
            var $temp = $(t);

            $temp.data('tpl', tpl);
            $temp.attr('data-id', tpl.id);

            var pageInfo = tpl.resource;

            if (tpl.thumbnail != null) {
                var imgThumbnail = $temp.find('img.page_thumbnail')[0];

                var height = sizeConverter.mmToPx(pageInfo.height) * 90 / sizeConverter.mmToPx(pageInfo.width);
                if (Math.floor(imgThumbnail.height) !== Math.floor(height)) {
                    $(imgThumbnail).attr('src', tpl.thumbnail).css({
                        width : 90,
                        height: height
                    });
                }

                $temp.css({
                    height : height
                }).find('canvas').remove();

            } else {
                var canvasThumbnail = $temp.find('canvas.page_thumbnail')[0];

                var height = sizeConverter.mmToPx(pageInfo.height) * 90 / sizeConverter.mmToPx(pageInfo.width);
                if (Math.floor(canvasThumbnail.height) !== Math.floor(height)) {
                    $(canvasThumbnail).attr({
                        width : 90,
                        height: height
                    });
                }

                $temp.css({
                    height : height
                }).find('img').remove();

                canvasUtil.generatePreviewCanvas(pageInfo, {}, function (e) {
                    var canvas = e.canvas;

                    var context = canvasThumbnail.getContext('2d');
                    var resultCanvas = pageUtil.scaleImage(canvas, canvasThumbnail.width, canvasThumbnail.height);

                    context.drawImage(resultCanvas, 0, 0);

                    //更新缩略图
                    if (tpl.thumbnail == null) {
                        canvasUtil.generateThumbnail(pageInfo, {}, function(e) {
                            var ir = e.ir;
                            Api.template.updatePageTemplate(tpl.id, {
                                thumbnail : ir.src
                            }, function(newTpl) {
                                templatePool.del(tpl.id);
                                newTpl.resource = tpl.resource;
                                templatePool.add(newTpl);
                                init();
                            });
                        }, 108);
                    }
                }, 108);
            }
            $list.append($temp);

        })
    }

    function initAdminTemplateList(page) {
        var imgSelectNum = $('#left-template-main select').val();
        var type = page;
        if (page == undefined) {
            type = view.edit.getActivePage().attr('data-type');
        } else {
            type = page.type;
        }

        var tplList = templatePool.getAll(imgSelectNum, type);
        $leftTemplateList.empty();
        if (tplList.length == 0) {
            $leftTemplateList.append($('#empty').html());
        } else {
            initTemplateList($leftTemplateList, tplList);
        }
        $('#left-template-num').text(tplList.length);
    }


    function bind() {
        $lefTemplateMain.unbind('click').on('click', '.left-template-li', function() {
            var tpl = $(this).data('tpl');

            opEvent.eTemplateListItemSelected.trigger(exports, {
                currentPageSeq: view.edit.getActivePageSeq(),
                template:  tpl.resource
            });

        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $tplLi = $(this).parent();
            var tpl = $tplLi.data('tpl');

            Api.template.delPageTemplate(tpl.id, function() {
                templatePool.del(tpl.id);

                init();
                SureMsg.success("删除成功");
            });
        }).on('change', 'select', function() {
            initAdminTemplateList();
        });
    }


    var events =  {
        eTemplateListItemSelected : new Event()
    };

    function initEvent() {
        opEvent.ePageListItemSelected.register(function(e) {
            var pageSeqs = e.pageSeqs,
                selectedPageSeq = e.selectedPageSeq;

            if (selectedPageSeq === undefined) {
                selectedPageSeq = pageSeqs[0];
            }
            var page = model.book.getPageBySeq(selectedPageSeq);

            initAdminTemplateList(page);
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;
});
define('leftBackground',['size-converter','event'], function(require, exports, module)  {

    var SizeConverter = require('size-converter');
    var sizeConverter = new SizeConverter(108);

    var Event = require('event');

    var $leftBackgroundMain = $('#left-background-main');
    var $leftBackgroundSystemList = $('#left-background-system-list');
    var $leftBackgroundUserList = $('#left-background-user-list');

    function init() {
        initTag();

        initAdminList();
        initUserList();
    }

    function initTag() {
        var tags = ["全部"];
        if (typeof systemBgTag != undefined && systemBgTag != "") {
            tags = systemBgTag.split(",");
        }

        var h = "";
        $.each(tags, function(i, tag) {
            if (tag == "全部") {
                h += '<li class="active">' + tag + '</li>';
            } else {
                h += '<li >' + tag + '</li>';
            }
        });

        $('#left-background-tag ul').empty().append(h);
    }

    function initBackgroundList($list, backgrounds) {
        var t = $('#left-background-list-template').html();
        $.each(backgrounds, function(i, d) {
            var $temp = $(t);

            $temp.data('background', d);
            $temp.attr('data-id', d.id);
            $temp.find('img').attr('src', d.value + "?imageView2/2/w/100");

            $list.append($temp);
        })
    }

    function initAdminList() {
        var tag = $('#left-background-tag li.active').text();
        var bgList = backgroundPool.getByTag(tag);
        $leftBackgroundSystemList.empty();
        if (bgList.length == 0) {
            $leftBackgroundSystemList.append($('#empty').html());
        } else {
            initBackgroundList($leftBackgroundSystemList, bgList);
        }
        $('#left-background-total-system-num').text(bgList.length);
    }

    function initUserList() {
        var bgList = backgroundPool.getUser();
        $leftBackgroundUserList.empty();
        if (bgList.length == 0) {
            $leftBackgroundUserList.append($('#empty').html());
        } else {
            initBackgroundList($leftBackgroundUserList, bgList);
        }
        $('#left-background-total-user-num').text(bgList.length);
    }

    function bind() {
        $leftBackgroundMain.unbind('click').on('click', '#backgroundUpload', function() {
            opEvent.ePopUpload.trigger(exports, {
                type : 'background',
                onUpload : function(ir, cb) {
                    Api.material.addUser(Api.material.createBackground(ir), function(addBackground) {
                        backgroundPool.addOne(addBackground);
                        cb(ir);
                    });
                },
                onClose: function() {
                    init();
                },
                check:  function(file, bookId, existCb, noExistCb ) {
                    backgroundPool.isExist(file, bookId, existCb, noExistCb);
                }
            })
        }).on('click', '.left-background-item', function() {
            var bg = $(this).data('background');
            var thumb = $(this).find('img').attr('src');

            opEvent.eNewShadingInsert.trigger(exports, {
                bg : bg,
                pageSeq: view.edit.getActivePageSeq(),
                shadingId: bg.id,
                shadingEdit: bg.url,
                shadingThumb: thumb,
                imgWidth: sizeConverter.pxToMm(bg.width)
            });

        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $backgroundLi = $(this).parent();
            var background = $backgroundLi.data('background');

            Api.material.del(background.id, function() {
                backgroundPool.deleteOne(background.id);

                init();
                SureMsg.success("删除成功");
            });
        }).on('click', '#left-background-tag li', function(e) {
            $(this).addClass('active').siblings().removeClass('active');
            initAdminList()
        });
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        eNewShadingInsert : new Event()
    };


    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
});
define('leftDecoration',['draggable','transform','size-converter','event'], function(require, exports, module)  {

    var Draggable = require('draggable');
    var transform = require('transform');
    var SizeConverter = require('size-converter');
    var Event = require('event');

    var sizeConverter = new SizeConverter(108);

    var $leftDecorationMain = $('#left-decoration-main');
    var $leftDecorationSystemList = $('#left-decoration-system-list');
    var $leftDecorationUserList = $('#left-decoration-user-list');

    function init() {
        initTag();

        initAdminList();
        initUserList();
    }

    function initTag() {
        var tags = ["全部"];
        if (typeof systemDeTag != undefined && systemDeTag != "") {
            tags = systemDeTag.split(",");
        }

        var h = "";
        $.each(tags, function(i, tag) {
            if (tag == "全部") {
                h += '<li class="active">' + tag + '</li>';
            } else {
                h += '<li >' + tag + '</li>';
            }
        });

        $('#left-decoration-tag ul').empty().append(h);
    }

    function initDecorationList($list, decorations) {
        var t = $('#decoration-li-template').html();
        $.each(decorations, function(i, d) {
            var $temp = $(t);

            $temp.data('decoration', d);
            $temp.attr('data-id', d.id);
            $temp.find('img').attr('src', d.value + "?imageView2/2/w/100");

            $list.append($temp);
        })
    }

    function initAdminList() {
        var tag = $('#left-decoration-tag li.active').text();
        var decorationList = decorationPool.getByTag(tag);
        $leftDecorationSystemList.empty();
        if (decorationList.length == 0) {
            $leftDecorationSystemList.append($('#empty').html());
        } else {
            initDecorationList($leftDecorationSystemList, decorationList);
        }
        $('#left-decoration-total-system-num').text(decorationList.length);
    }

    function initUserList() {
        var decorationList = decorationPool.getUser();
        $leftDecorationUserList.empty();
        if (decorationList.length == 0) {
            $leftDecorationUserList.append($('#empty').html());
        } else {
            initDecorationList($leftDecorationUserList, decorationList);
        }

        $('#left-decoration-total-user-num').text(decorationList.length);
    }

    function initDecorationDragEvent() {
        var draggable = new Draggable('#left-decoration-main .decorate_main_box ', 'li', 10, 0, false);

        var img;
        draggable.dragStart.register(function (e) {
            if (e.event.type.indexOf('touch') > -1) { //触摸下如果是纵向拖拽
                if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    e.prevent();
                    return;
                } else {
                    e.event.preventDefault();
                }
            }

            var curTar = $(e.currentTarget);

            if (curTar.attr("is-loading")) {
                e.prevent();
                return;
            }

            curTar.data('click', false);

            var thumbnail = curTar.children('img');
            if (thumbnail.length === 0) {
                e.prevent();
                return;
            }

            var decoration = curTar.data('decoration');
            img = thumbnail.clone();
            img.data('decoration', decoration);

            img.css({
                position: 'absolute',
                'z-index': 100,
                top: 0,
                left: 0,
                visibility: 'hidden',
                'backface-visibility:': 'hidden'
            }).addClass('photo-drag-thumb');

            //img[0].getContext('2d').drawImage(curImg[0], 0, 0);

            $('body').addClass('dragging-decoration');
            img.appendTo('body');

            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();

            transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));

            img.css({
                visibility: 'visible'
            });

            $("#section_book_edit").attr("data-strike", "true");
        });
        draggable.drag.register(function (e) {
            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();
            if (imgOuterWidth * imgOuterHeight > 0) {
                img.css('visibility', 'visible');
                transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));
            }

            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            img.data('cushionClockToken', setTimeout(function () {
                img.css('display', 'none');
                var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(), e.pageY - $(window).scrollTop()));
                img.css('display', 'block');
            }, 1000 / 60));
        });
        draggable.dragEnd.register(function (e) {
            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            var decoration = img.data('decoration');
            img.remove();
            img = null;

            var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(),
                e.pageY - $(window).scrollTop()));

            var page;
            var pageSeq, pageRect, bookScale;

            if (element.is('.page, .page *')) {
                page = element.hasClass('page') ? element : element.parents('.page');
                pageSeq = page.attr('data-seq');
                pageRect = view.edit.getPageRect(page, true);
                bookScale = view.edit.getBookCurrentScale();

                var activePageSeq = view.edit.getActivePageSeq();
                if ((activePageSeq != "flyleaf" && activePageSeq != "copyright")){
                    opEvent.eNewDecorationInsert.trigger(exports, {
                        decoration: decoration,
                        pageSeq: pageSeq,
                        x: sizeConverter.pxToMm((e.pageX - pageRect.left) / bookScale),
                        y: sizeConverter.pxToMm((e.pageY - pageRect.top) / bookScale)
                    });
                }
            }

            $('body').removeClass('dragging-decoration');

            $("#section_book_edit").attr("data-strike", "false");
        });
    }


    function bind() {
        $leftDecorationMain.unbind('click').on('click', '#decorationUpload', function() {
            opEvent.ePopUpload.trigger(exports, {
                type : 'decoration',
                onUpload : function(ir, cb) {
                    Api.material.addUser(Api.material.createDecoration(ir), function(addDecoration) {
                        decorationPool.addOne(addDecoration);
                        cb(ir);
                    });
                },
                onClose: function() {
                    init();
                },
                check:  function(file, bookId, existCb, noExistCb ) {
                    decorationPool.isExist(file, bookId, existCb, noExistCb);
                }
            })
        }).on('click', '.delete_key', function(e) {

            e.preventDefault();
            e.stopPropagation();

            var $decorationLi = $(this).parent();
            var decoration = $decorationLi.data('decoration');
            Api.material.del(decoration.id, function() {
                decorationPool.deleteOne(decoration.id);
                init();
                SureMsg.success("删除成功");
            });

        }).on('click', '#left-decoration-tag li', function(e) {
            $(this).addClass('active').siblings().removeClass('active');
            initAdminList()
        });

        initDecorationDragEvent();
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        eNewDecorationInsert : new Event()
    };


    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
});
define('leftPageList',['pageUtil','event'], function(require, exports, module) {

    var pageUtil = require('pageUtil');
    var Event = require('event');

    var $leftPageList = $('#left-page-list');

    function init(bookInfo) {
        var photos = model.photo.getPhotos();

        pageUtil.initPageList($leftPageList, bookInfo, photos, "single", function() {});
    }

    function refresh(book, photos, selSeq, callback) {
        setTimeout(function () {
            pageUtil.initPageList($leftPageList, book, photos, 'single', function () {
                if (typeof callback === 'function') {
                    callback.call(exports);
                }
            });
        }, 100);
    }

    function bind() {

        $('#left-page-list-main').unbind('click').on('click', '.j-add-page', function() {
          opEvent.ePopAddPage.trigger(exports, {});
        }).on('click', '.page_item', function(e) {

            var $this = $(this),
                pageSeqs = $this.attr('data-page-seq').split(',');

            var selectedPageSeq;
            if ($(e.target).hasClass('page_thumbnail')) {
                selectedPageSeq = $(e.target).attr('data-page-seq');
            } else {
                selectedPageSeq = pageSeqs[0];
            }

            if (checkSaved()) {
                opEvent.eBookSaving.trigger(exports, {});
            }

            opEvent.ePageListItemSelected.trigger(exports, {
                currentPageSeqs: view.edit.getCurrentPageSeqs(),
                pageSeqs: pageSeqs,
                selectedPageSeq: selectedPageSeq
            });
        });
    }

    function setPageSelected(pageSeq) {
        $leftPageList.find('.page_thumbnail').attr('aria-selected', false)
            .filter('[data-page-seq=' + pageSeq + ']').attr('aria-selected', true)
            .parents('.page_item').attr('aria-selected', true)
            .siblings('.page_item').attr('aria-selected', false);

        var selectedItem = $leftPageList.children('.page_item[aria-selected="true"]');

        var selectedItemRect = selectedItem[0].getBoundingClientRect();
        var listPageWrapperRect = $leftPageList.parent()[0].getBoundingClientRect();

        if (selectedItemRect.top < listPageWrapperRect.top) {
            $leftPageList.parent().stop(true, true).animate({
                scrollTop: ('-=' + (listPageWrapperRect.top - selectedItemRect.top + selectedItemRect.height))
            });
        } else if (selectedItemRect.bottom > listPageWrapperRect.bottom) {
            $leftPageList.parent().stop(true, true).animate({
                scrollTop: ('+=' + (selectedItemRect.bottom - listPageWrapperRect.bottom + selectedItemRect.height))
            });
        }
    }

    function checkSaved() {
        for (var key in window.changed) {
            return true;
        }
        return false;
    }

    function initEvent() {
        opEvent.eDrawPageThumbnail.register(function (e) {

            var pageInfo = e.pageInfo,
                photos = e.photos,
                callback = e.callback;

            pageUtil.drawPageThumbnail($leftPageList, pageInfo, photos, callback);
        });

        opEvent.eSetPageActive.register(function (e) {
            var pageSeq = e.pageSeq;

            setPageSelected(pageSeq);
        });

        opEvent.eRefreshAll.register(function (e) {
            var book = e.book;
            var photos = e.photos;
            var selSeq = e.selectPageSeq;

            refresh(book, photos, selSeq, function() {});
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {};
    exports.initEvent = initEvent;
    exports.refresh = refresh;
});
define('leftPhoto',['size-converter','event','draggable','transform','pageUtil'], function(require, exports, module) {

    var SizeConverter = require('size-converter');
    var Event = require('event');
    var Draggable = require('draggable');
    var transform = require('transform');
    var pageUtil = require('pageUtil');

    var sizeConverter = new SizeConverter(108);

    var $leftPhotoList = $('#left-photo-list');
    var photoResTemplate = $('#left-photo-template');
    var $leftPhotoTotalNum = $('#left-photo-total-num');

    function buildPhotoTr(il) {
        var template = photoResTemplate.html();
        var $photo = $(template);

        $photo.find('.img_thumbnail').attr('src', il.ir.src + "?imageView2/2/w/100");

        $photo.data("il", il);

        $photo.attr('data-photo-id', il.id);
        $photo.attr('data-photo-md5', il.ir.checksum);

        initFindPhotoPage($photo);

        return $photo;
    }

    function initPhotoDragEvent() {
        var draggable = new Draggable($leftPhotoList, 'li', 10, 0, false);

        var img;
        draggable.dragStart.register(function (e) {
            if (e.event.type.indexOf('touch') > -1) { //触摸下如果是纵向拖拽
                if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
                    e.prevent();
                    return;
                } else {
                    e.event.preventDefault();
                }
            }

            var curTar = $(e.currentTarget);

            if (curTar.attr("is-loading")) {
                e.prevent();
                return;
            }

            curTar.data('click', false);

            var thumbnail = curTar.children('.img_thumbnail');
            if (thumbnail.length === 0) {
                e.prevent();
                return;
            }

            var il = curTar.data('il');
            img = thumbnail.clone();
            img.data('il', il);

            img.css({
                position: 'absolute',
                'z-index': 100,
                top: 0,
                left: 0,
                visibility: 'hidden',
                'backface-visibility:': 'hidden'
            }).addClass('photo-drag-thumb');

            //img[0].getContext('2d').drawImage(curImg[0], 0, 0);

            $('body').addClass('dragging-photo');
            img.appendTo('body');

            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();

            transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));

            img.css({
                visibility: 'visible'
            });

            $("#section_book_edit").attr("data-strike", "true");
        });
        draggable.drag.register(function (e) {
            var imgOuterWidth = img.outerWidth();
            var imgOuterHeight = img.outerHeight();
            if (imgOuterWidth * imgOuterHeight > 0) {
                img.css('visibility', 'visible');
                transform.translate(img, (e.pageX - imgOuterWidth / 2), (e.pageY - imgOuterHeight / 2));
            }

            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            img.data('cushionClockToken', setTimeout(function () {
                img.css('display', 'none');
                var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(), e.pageY - $(window).scrollTop()));
                img.css('display', 'block');

                $('.imageslot').removeClass('dragover');
                if (element.is('.imageslot,.imageslot *')) {
                    var imageSlot = element.hasClass('imageslot') ? element : element.parents('.imageslot');
                    imageSlot.addClass('dragover');
                    img.removeClass('grabbing-cursor');
                    img.css({
                        cursor: 'copy'
                    });
                } else {
                    img.addClass('grabbing-cursor');
                }
            }, 1000 / 60));
        });
        draggable.dragEnd.register(function (e) {
            if (img.data('cushionClockToken')) {
                clearTimeout(img.data('cushionClockToken'));
            }
            var il = img.data('il');
            img.remove();
            img = null;

            var element = $(document.elementFromPoint(e.pageX - $(window).scrollLeft(),
                    e.pageY - $(window).scrollTop()));

            var imgSlot, page;
            var pageSeq, pageRect, bookScale;

            if (element.is('.imageslot,.imageslot *')) {
                imgSlot = element.hasClass('imageslot') ? element : element.parents('.imageslot');
                pageSeq = imgSlot.parent().attr('data-seq');
                opEvent.eInsertNewPhotoToSlot.trigger(exports, {
                    il: il,
                    pageSeq: pageSeq,
                    name: imgSlot.attr('data-name'),
                    isNet: true
                });
            } else if (element.is('.page, .page *')) {
                page = element.hasClass('page') ? element : element.parents('.page');
                pageSeq = page.attr('data-seq');
                pageRect = view.edit.getPageRect(page, true);
                bookScale = view.edit.getBookCurrentScale();

                var activePageSeq = view.edit.getActivePageSeq();
                if ((activePageSeq != "flyleaf" && activePageSeq != "copyright")){
                    opEvent.eEmptyDrop.trigger(exports, {
                        il: il,
                        pageSeq: pageSeq,
                        x: sizeConverter.pxToMm((e.pageX - pageRect.left) / bookScale),
                        y: sizeConverter.pxToMm((e.pageY - pageRect.top) / bookScale)
                    });
                }
            }
            $('.imageslot').removeClass('dragover');
            $('body').removeClass('dragging-photo');

            $("#section_book_edit").attr("data-strike", "false");
        });
    }

    function initFindPhotoPage($photoLi) {
        var md5 = $photoLi.attr("data-photo-md5");

        var allPages = model.book.getAllPages();

        $.each(allPages, function(i, page) {
            var imageList = page.imageSlotList;
            for (var i = 0; i < imageList.length; i++) {
                if (imageList[i].image) {
                    var picMd5 = imageList[i].image.id;
                    if (picMd5 == md5) {
                        var pageSeq = page.seq;

                        $photoLi.addClass('has_been_choice');

                        var spanText = pageSeq;
                        if (pageSeq == "front-cover") {
                            spanText = "封";
                        }
                        if (pageSeq == "back-cover") {
                            spanText = "底";
                        }

                        if (pageSeq == "flyleaf") {
                            spanText = "扉";
                        }

                        if (pageSeq == "backFlap") {
                            spanText = "前";
                        }

                        if (pageSeq == "frontFlap") {
                            spanText = "后";
                        }

                        if (pageSeq == "spine") {
                            spanText = "脊";
                        }

                        if (pageSeq == "copyright") {
                            spanText = "版";
                        }

                        $photoLi.children("span").attr('data-page-seq', pageSeq).text(spanText);
                        return false;
                    }
                }
            }
        });

        if (!$photoLi.hasClass('has_been_choice')) {
            $photoLi.children("span").remove();
        }
    }


    function init() {
        var photos = model.photo.getPhotos(model.book.getBookId());

        $leftPhotoList.empty();
        $leftPhotoTotalNum.text(photos.length);

        if (photos.length > 0) {
            for (var i = 0; i < photos.length; i ++) {
                $leftPhotoList.append(buildPhotoTr(photos[i]));
            }
        } else {
            $leftPhotoList.append($('#empty').html());
        }
    }

    function bind() {
        initPhotoDragEvent();


        $('#left-photo-main').on('click', '#photoUploadFile', function() {
            opEvent.ePopUpload.trigger(exports, {
                type : 'photo',
                onUpload : function(ir, cb) {
                    model.photo.addPhoto(model.book.getBookId(), ir.name, "", ir, function (ret) {
                        cb(ret);
                    });
                },
                onClose: function() {
                    init();
                },
                check:  function(file, bookId, existCb, noExistCb ) {
                    model.photo.isILExist(file, bookId, existCb, noExistCb);
                }
            });
        }).on('click', '.delete_key', function(e) {
            var $photoLi = $(this).parent();
            var il = $photoLi.data('il');

            model.photo.deletePhoto(model.book.getBookId(), il.ir.checksum, function() {
                model.photo.delById(il.ir.checksum);
                init();
                SureMsg.success("删除成功");
            });
        }).on('click', '.has_been_choice', function() {
            var $photoLi = $(this);
            var il = $photoLi.data('il');

            var pageSeq = $photoLi.children("span").attr('data-page-seq');
            view.pagelist.goto(pageSeq);
        }).on('click', '.add_new_photo', function() {
            //添加照片按钮下拉 add_new_photo show select options
            $(this).toggleClass('open');

            $(window).on('click', function(e) {
                if($(e.target).closest('.add_new_photo').length == 0) {
                    $('.add_new_photo').removeClass('open');
                }
            });
        }).on('click', '.btn_phone_upload', function() {
            art.dialog({
                title: '扫一扫',
                lock: true,
                fixed: true,
                content: document.querySelector('.phone_upload_pop')
            });
        }).on('ifChanged', '#left-photo-hide-use', function() {
            var isHide = $(this).attr('checked') == "checked";
            if (isHide) {
                $('#left-photo-main .has_been_choice').hide();
            } else {
                $('#left-photo-main .has_been_choice').show();
            }
        });

    }

    var events =  {
        eEmptyDrop : new Event()
    };

    function initEvent() {
        opEvent.eEmptyDrop.register(function (e) {
            var pageSeq = e.pageSeq;

            if (['blank', 'spine', 'front-flap'].some(function (seq) {
                    return seq === pageSeq;
                }))
                return;

            var il = e.il;
            var x = e.x;
            var y = e.y;

            var page = model.book.getPageBySeq(pageSeq);

            var imageSlot = {
                width: 100,
                height: 100
            };

            imageSlot.x = x - imageSlot.width / 2;
            imageSlot.y = y - imageSlot.height / 2;

            imageSlot.image = {
                width: imageSlot.width,
                id: il.ir.checksum,
                fileName: il.name,
                rotation: 0
            };

            var imageSlotRatio = imageSlot.width / imageSlot.height;
            var photoRatio = il.ir.width / il.ir.height;

            if (photoRatio > imageSlotRatio) {
                imageSlot.image.width = imageSlot.height * photoRatio;
            } else {
                imageSlot.image.width = imageSlot.width;
            }

            imageSlot.image.x = (imageSlot.width - imageSlot.image.width) / 2;
            imageSlot.image.y = (imageSlot.height - imageSlot.image.width / photoRatio) / 2;

            //if (imageSlot.image.x + imageSlot.image.width > page.width)
            //    imageSlot.image.x = page.width - imageSlot.image.width;
            //else if (imageSlot.image.x < 0)
            //    imageSlot.image.x = 0;

            //if (imageSlot.image.y + imageSlot.image.height > page.height)
            //    imageSlot.image.y = page.height - imageSlot.image.height;
            //else if (imageSlot.image.y < 0)
            //    imageSlot.image.y = 0;

            if (!page)
                return;

            var imageSlot = model.book.insertImageSlot(page.seq, imageSlot);

            if (imageSlot.image && imageSlot.image.id) {
                var photo = model.photo.getById(imageSlot.image.id);
                //photo.usedCount++;
                //view.photoManager.setUsedCount(photo.id, photo.usedCount);
            }

            var photos = model.photo.getPhotoInPage(page);
            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page);
            view.edit.selectSlot(pageSeq, imageSlot.name);
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;

    exports.initPhoto = init;

});
define('addPage',['event'], function(require, exports, module) {

    var Event = require('event');

    function init() {

    }

    function bind() {
        $('#addPageBox').unbind('click').on('click', '.j-save', function() {

            var addPageNum = $('#addPageBox #popAddPageNum').val();
            if (addPageNum == null) {
                addPageNum = 2;
            } else {
                addPageNum = parseInt(addPageNum);
                if (addPageNum % 2 == 1) {
                    addPageNum += 1;
                }
            }

            var addPostion = $('#addPageBox input[name="pagePosition"]:checked').val();

            opEvent.eAddPage.trigger(exports, {
                addPageNum : addPageNum,
                addPostion : addPostion
            });

            SureUtil.closeDialog('popAddPage');
        }).on('click', '.j-cancel', function() {
            SureUtil.closeDialog('popAddPage');
        });
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        ePopAddPage : new Event(),
        eAddPage : new Event()
    };

    function initEvent() {
        opEvent.ePopAddPage.register(function(e) {
            art.dialog({
                id : 'popAddPage',
                title:"添加页面",
                lock:true,
                padding:0,
                fixed:true,
                content:document.querySelector('#addPageBox')
            })
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
    exports.initEvent = initEvent;

});
define('upload',['event','uploader','ImageRes'], function(require, exports, module) {

    var Event = require('event');
    var Uploader = require('uploader');
    var imageRes = require('ImageRes');

    var imageUp = null;
    var upQueue = [];
    var currentUpQueue = [];

    var onUploadCb = function () {};
    var onCloseCb = function () {};
    var checkExist = function() {
        return false;
    } ;

    function getObjectURL(file) {
        var url = null;
        if (window.createObjectURL != undefined) { // basic
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
    }

    function getBlobFileSrc(file) {
        var src;
        if (typeof file.getNative != 'undefined')
            src = getObjectURL(file.getNative());
        else
            src = getObjectURL(file);
        return src;
    }

    function buildWaitUpFileDiv(src) {
        src = getObjectURL(src);
        var progressli = '<li class="waitUp">';
        progressli += '<a href="javascript:;">';
        progressli += '	<img src="' + src + '" class="cm_cp">';
        progressli += '</a>';
        progressli += '<div class="load_per uploading">上传<span>0%</span></div>';
        progressli += '</li>';

        return progressli;
    }

    function buildUpImageLinkDiv(file, src) {
        src = src || getObjectURL(file.getNative());

        var progressli = "<li  id=" + file.id + ">";
        progressli += "	<a class='preview' href='javascript:;'><img src='" + src + "'></a>";
        progressli += '<div class="load_per uploading">等待中</div>';
        progressli += "</li>";
        return progressli;
    }

    function buildImageLinkDiv(il) {
        var isS = "selected";
        var ir = il.ir;

        if (ir == undefined) {
            ir = il;
        }
        var ilDiv = '<li ilId="' + ir.checksum + '">' +
            '<a class="' + isS + '" href="javascript:;">' +
            '<img src="' + ir.src + '?imageView2/1/w/125/h/125/format/jpg" class="cm_cp">' +
            '<span class="ybiconfont ybicon-ok"></span>' +
            '</a></li>';
        return ilDiv;
    }

    function uploadOK(il) {
        var ilDiv = buildImageLinkDiv(il);
        $('#imageLink_upload_container .new_up .photo_list').prepend(ilDiv);
        $('#imageLink_upload_container .tips .up_num').removeClass('hidden');
        var num = $('#imageLink_upload_container .tips span').eq(0).text();
        num++;
        $('#imageLink_upload_container .tips span').eq(0).text(num);
    }


    //页面初始化
    function init() {
        upQueue = [];
        currentUpQueue = [];

        var belongId = "1";
        if (typeof model != 'undefined') {
            belongId = model.book.getBookId()
        }

        if (imageUp == null) {
            SureAjax.ajax({
                url : '/qiniu/upToken?scope=' + qiniu_book_bucket,
                success : function(ret){
                    imageUp = new Uploader({
                        belongId: belongId,
                        bucket: qiniu_book_bucket,
                        domain: qiniu_book_domain,
                        uptoken: ret.uptoken,
                        browse_button: 'localFile_more',
                        container: 'upload',
                        drop_element: 'upload'
                    }, {
                        'FilesAdded': function (up, files) {
                            var needUp = files.length > 12 ? 12 : files.length;
                            $('#imageLink_upload_container .choose_img_con').removeClass('hidden');
                            $('#imageLink_upload_container .uploading').removeClass('hidden').removeClass('finished');
                            $('#imageLink_upload_container .to_upload').removeClass('hidden');
                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(files.length + upQueue.length);
                            $('.to_upload .photo_list .waitUp').remove();
                            $('#imageLink_upload_container .empty').addClass('hidden');
                            $('#imageLink_upload_container .choose_img_con .img_con').removeClass('hidden');
                            $("#imageLink_upload_container .complete").hide();

                            var i = 0;
                            plupload.each(files, function (file) {
                                if (i++ > 11) {
                                    upQueue.push(file.getNative());
                                    up.removeFile(file);
                                    return true;
                                }
                                file.name = file.name.replace(/\s+/g, "");
                                var name_len = file.name.length;
                                //验证图片名称长度，要求小于50
                                if (name_len > 50) {
                                    file.name = file.name.substr(0, 50);
                                }
                                var progressli = buildUpImageLinkDiv(file);
                                $('.to_upload .photo_list').append(progressli);
                            });
                            i = 0;
                            setTimeout(function () {
                                plupload.each(files, function (file) {
                                    if (i++ > 11) {
                                        return false;
                                    }
                                    setTimeout(function () {
                                        checkExist(file.getNative(), belongId, function (il) {
                                            var ir = il.ir;

                                            if (ir == undefined) {
                                                ir = il;
                                            }

                                            up.removeFile(file);
                                            $("#" + file.id).remove();
                                            var wn = $('#imageLink_upload_container .to_upload .title .cm_fl span').text();
                                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(wn - 1);
                                            if (upQueue.length > 0) {
                                                var nextFile = upQueue.shift();
                                                currentUpQueue.push(nextFile);
                                                var progressli = buildWaitUpFileDiv(nextFile);
                                                $('.to_upload .photo_list').append(progressli);
                                            }
                                            needUp--;
                                            if ($(".new_up li[ilId=" + ir.checksum + "]").length > 0) {
                                                SureMsg.msg("已经存在一张同样的图片了 ");
                                            } else {
                                                uploadOK(il);
                                            }
                                            if (needUp == 0) {
                                                up.start();
                                            }
                                        }, function (md5) {
                                            file.md5 = md5;
                                            needUp--;
                                            if (needUp == 0) {
                                                up.start();
                                            }
                                        });
                                    }, 100);
                                });
                            }, 500);
                        },
                        'UploadProgress': function (up, file) {
                            var shadeHeight = 125 * (1 - parseFloat(file.percent) / 100);
                            $("#" + file.id).find('.load_per').html('上传<span>' + file.percent + '%</span>');
                            $("#" + file.id).find('.load_per').height(shadeHeight);
                        },
                        'FileUploaded': function (up, file, info) {
                            var nextFile = null;
                            if (upQueue.length > 0) {
                                nextFile = upQueue.shift();
                                currentUpQueue.push(nextFile);
                            }
                            // 每个文件上传成功后,处理相关的事情
                            var res = $.parseJSON(info);
                            var img = $("#" + file.id).find("img")[0];
                            var wn = $('#imageLink_upload_container .to_upload .title .cm_fl span').text();
                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(wn - 1);

                            var exif = {};
                            EXIF.getData(img, function () {
                                exif = EXIF.getAllTags(this);
                            });

                            $("#" + file.id).remove();
                            if (nextFile != null) {
                                var progressli = buildWaitUpFileDiv(nextFile);
                                $('.to_upload .photo_list').append(progressli);
                            }
                            var ir = imageRes.createIRFromQiniu(up, file, res, exif);
                            !!onUploadCb && onUploadCb(ir, function(ret) {
                                uploadOK(ret);
                            });
                        },
                        'UploadComplete': function (up) {
                            if (currentUpQueue.length > 0) {
                                up.addFile(currentUpQueue);
                                currentUpQueue = [];
                            } else {
                                $('#imageLink_upload_container .uploading').addClass('finished');
                                $('#imageLink_upload_container .to_upload').addClass('hidden');
                                $("#imageLink_upload_container .complete").show();

                                !!onCloseCb && onCloseCb();
                            }
                        }
                    });
                }
            });
        }
    }

    //页面内事件绑定
    function bind() {
        $("#imageLink_upload_container").unbind('click').on('click', ".finish", function () {
            SureUtil.closeDialog('imageLinkUpload');
        }).on('click', ".empty a.btn", function () {
            $("#imageLink_upload_container input[type=file]").trigger('click');
        });

        if ($.os.mobile) {
            $("#imageLink_upload_container #localFile_more").unbind('click').on('click', function () {
                $("#imageLink_upload_container input[type=file]").trigger('click');
            });
        }
    }

    function popUploadDialog(e) {
        onUploadCb = e.onUpload;
        onCloseCb = e.onClose;
        checkExist = e.check;

        var finishName = e.finishBtnName;
        if (!!finishName) {
            $('.finishBtnName').text(finishName);
        }

        art.dialog({
            id: "imageLinkUpload",
            title: '上传图片',
            lock: true,
            content: document.getElementById('imageLink_upload_container'),
            close: function () {
                if (imageUp != null) {
                    imageUp.stopUpload();
                    imageUp.qiniuUploader.destroy();
                    imageUp = null;
                }

                !!onCloseCb && onCloseCb();
            },
            init: function () {
                $('#imageLink_upload_container .choose_img_con').addClass('hidden');
                $('#imageLink_upload_container .empty').removeClass('hidden');
                $('#imageLink_upload_container .tips .up_num span').text(0);
                $('#imageLink_upload_container .tips .up_num').addClass('hidden');
                $('#imageLink_upload_container .uploading .photo_list').empty();
                $('#imageLink_upload_container .to_upload .photo_list').empty();

                init();
            }
        });
    }

    //页面重置
    function reload() {

    }

    //页面加载
    function load() {

    }

    //页面内定义的事件
    var events =  {
        ePopUpload : new Event()
    };

    function initEvent() {
        events.ePopUpload.register(function(e) {
            popUploadDialog(e);
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;

    exports.events = events;
    exports.initEvent = initEvent;

    exports.popUploadDialog = popUploadDialog;

});

define('toptool',['event'], function(require, exports, module) {

    var Event = require('event');
    var $topToolContainer = $('#top-tool-container');

    function init(book) {
        initTopBookInfo(book.name, model.book.computeCompletedPercent());
    }

    function initTopBookInfo(name, percent) {
        $('#top-book-info .book_name').text("《" + name + "》");
        $('#top-book-info .percent > span').text(percent.toFixed(2) * 100 + "%");
    }

    function bind() {

        $('#showBookInfo').click(function(){
            art.dialog({
                id : 'editBookInfo',
                title: '作品基本信息',
                lock: true,
                fixed: true,
                content: document.querySelector('#tplInfoBox'),
                init:function(){

                    var bookInfo = model.book.getBookInfo();

                    $('#tplInfoBox .j-bookinfo[data-type="name"]').val(bookInfo.name);
                    $('#tplInfoBox .j-bookinfo[data-type="width"]').val(bookInfo.width);
                    $('#tplInfoBox .j-bookinfo[data-type="height"]').val(bookInfo.height);

//                $('.add_input .add_btn').click(function(){
//                    var newStyle = $(this).closest('.add_input').find('input').val(),
//                            styleBox = $(this).closest('.add_input').next();
//                    if(typeof(newStyle)!="undefined" && newStyle!=0){
//                        styleBox.prepend('<a href="javascript:;"><span class="ybiconfont ybicon-ok check"></span>' + newStyle + '</a>')
//                    }
//                });
//                $('.styles').on('click','a',function(){
//                    $(this).toggleClass('active')
//                })
                }
            });
        });

        $('#tplInfoBox').unbind('click').on('click', '.j-save', function() {

            var book = {};
            $('#tplInfoBox .j-bookinfo').each(function() {
                var type = $(this).attr('data-type');
                var value = $(this).val();

                book[type] = value;
            });

            if ((book.width != undefined && book.width != model.book.getBookInfo().width) ||
                (book.height != undefined && book.height != model.book.getBookInfo().height)) {
                SureMsg.confirm("修改了书册的尺寸，将会影响整个所有书页，确定修改？", function() {
                    opEvent.eChangeBookInfo.trigger(exports, {
                        book : book,
                        refresh : true
                    });
                    SureUtil.closeDialog('editBookInfo');
                }, function() {

                })
            } else {
                opEvent.eChangeBookInfo.trigger(exports, {
                    book : book,
                    refresh : false
                });
                SureUtil.closeDialog('editBookInfo');
            }
        }).on('click', '.j-cancel', function() {
            SureUtil.closeDialog('editBookInfo');
        });

        $topToolContainer.unbind('click').on('click', '.top-tool-btn', function(e) {
            e.stopPropagation();

            var btnOperation = $(this).attr('data-operation');

            switch (btnOperation) {
                case "btn-undo":
                    opEvent.ePageUndo.trigger(exports, {
                        pageSeq : view.edit.getActivePageSeq(),
                        operation : btnOperation
                    });
                    break;
                case "btn-redo":
                    opEvent.ePageRedo.trigger(exports, {
                        pageSeq : view.edit.getActivePageSeq(),
                        operation : btnOperation
                    });
                    break;
                case "btn-imageslot":
                    opEvent.eNewImageSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-textslot":
                    opEvent.eMewTextSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-shapeslot":
                    opEvent.eNewShapeSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-auto":
                    opEvent.eBookAutoComplete.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-check":
                    opEvent.eBookCheck.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-save":
                    opEvent.eBookSaving.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
            }

        });

        $('.edit_toolbar').unbind('click').on('click', '.top-tool-btn', function() {
            var opt = $(this).attr('data-operation');
            if (opt == 'btn-preview') {
                var from = $('body').attr('data-mode');
                var to = "preview-book";
                if (from == to) {
                    to = "edit-book";
                }
                opEvent.eModeChange.trigger(exports, {
                    from : from,
                    to : to
                });
            }
            if (opt == 'btn-publish') {
                SureMsg.confirm("确定发布书册？点击确定之后会批量处理缩略图。", function() {
                    SureMsg.showLoadBar("生成缩略图中...");
                    opEvent.eBookPublish.trigger(exports, {
                        isCreateThumb : true,
                        onSuccess : function() {
                            SureMsg.hideLoadBar();
                        }
                    });
                }, function() {

                });
            }
        });
    }

    //使能按钮
    function enableBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').attr('disabled', false);
    }

    //禁用按钮
    function disableBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').attr('disabled', true);
    }

    //激活按钮
    function activeBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').addClass('active');
    }

    //不激活按钮
    function inactiveBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').removeClass('active');
    }

    var events = {
        eBookAutoComplete : new Event(),
        eSavePageRes : new Event(),
        ePageUndo: new Event(),
        ePageRedo: new Event(),
        eBookSaving: new Event(),
        eBookCheck : new Event(),
        eBookPublish : new Event()
    };

    function initEvent() {
        opEvent.eChangeBookInfo.register(function(e) {
            var book = e.book;
            if (book.name != undefined) {
                $('#top-book-info .book_name').text("《" + book.name + "》");
            }
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;

    exports.enable = enableBtn;
    exports.disable = disableBtn;
    exports.active = activeBtn;
    exports.inactive = inactiveBtn;

});
define('pagesort',['draggable','transform','event','pageUtil'], function(require, exports, module) {

    var Draggable = require('draggable');
    var transform = require('transform');
    var Event = require('event');
    var pageUtil = require('pageUtil');

    var $pageSort = $('#page-sort'),
        $pageSortList = $('#page-sort-preview');

    var draggableItem;

    function initPageSort(book, photos, type) {
        $pageSort.removeData('sortedPages');
        pageUtil.initPageList($pageSortList, book, photos, type, function () {

        });

        $pageSortList.maskLoading({
            time: 2000,
            bgColor : "#EEEEEE",
            //check : function() {
            //    return isSubPageThumbnailOk;
            //},
            load: function () {
                $pageSortList.children('.page_item').addClass('no-transition');
                arrayPageListItems();
                $pageSortList.children('.page_item').removeClass('no-transition');

                if (!draggableItem) {
                    $(window).on('resize', function (e) {
                        if ($('body').attr('data-mode') === 'pagesort') {
                            arrayPageListItems();
                        }
                    });

                    draggableItem = new Draggable($pageSortList, '.page_item.sortable', 0, 0, false);
                    draggableItem.dragStart.register(function (e) {
                        var curTar = $(e.currentTarget);

                        var curTransform = transform.getCurrent(curTar);

                        curTar.addClass('no-transition ignore-array');

                        //开始拖动时元素的坐标
                        curTar.data('dragStartXY', {
                            x: curTransform.translationX,
                            y: (curTransform.translationY - $pageSortList.parent().scrollTop())
                        }).data('dragStartRect', curTar[0].getBoundingClientRect()).data('outerHeight', curTar.outerHeight(true));

                        transform.scale(curTar, 1.2);
                    });
                    draggableItem.drag.register(function (e) {
                        if (e.event.type.indexOf('touch') > -1) {
                            e.event.preventDefault();
                        }

                        var curTar = $(e.currentTarget);

                        var dragStartXY = curTar.data('dragStartXY');

                        transform.translate(curTar, dragStartXY.x + e.deltaX, dragStartXY.y + $pageSortList.parent().scrollTop() + e.deltaY);

                        if (curTar.data('delayClockToken')) {
                            clearTimeout(curTar.data('delayClockToken'));
                            curTar.removeData('delayClockToken');
                        }

                        curTar.data('delayClockToken', setTimeout(function () {
                            var dragStartRect = curTar.data('dragStartRect');

                            var outerHeight = curTar.data('outerHeight');
                            var lastPageX = curTar.data('lastPageX');
                            var allPages = $pageSortList.children('.page_item.sortable');
                            var sortedPages = $pageSort.data('sortedPages');

                            if (type != "single") {
                                sortedPages = allPages.sort(function (a, b) {
                                    var transformA = transform.getCurrent(a),
                                        transformB = transform.getCurrent(b);

                                    if ($(a).is(curTar)) {
                                        if (e.pageX >= lastPageX) {
                                            transformA.translationX += dragStartRect.width / 2;
                                        } else {
                                            transformA.translationX -= dragStartRect.width / 2;
                                        }
                                    }
                                    if ($(b).is(curTar)) {
                                        if (e.pageX >= lastPageX) {
                                            transformB.translationX += dragStartRect.width / 2;
                                        } else {
                                            transformB.translationX -= dragStartRect.width / 2;
                                        }
                                    }

                                    return (transformA.translationX + Math.round(transformA.translationY / outerHeight) * 1000000) - (transformB.translationX + Math.round(transformB.translationY / outerHeight) * 1000000);
                                });

                            } else {
                                !sortedPages && (sortedPages = allPages);
                                var temArr = [];
                                $.each(sortedPages, function (i) {
                                    temArr.push(sortedPages[i]);
                                    if ($(this).data("type") == "cross") {
                                        temArr.push("cross");
                                        //sortedPages.splice(i + 1, 0, "cross");
                                    }
                                });
                                sortedPages = temArr;
                                var lastPageIndex = $.inArray(curTar[0], sortedPages),
                                    neighbor,
                                    touchNum = -1;

                                sortedPages = (function () {

                                    var transformA = transform.getCurrent(curTar),
                                        transformB,
                                        aPoint = { x: transformA.translationX + curTar.width() / 2, y: transformA.translationY + 35 },
                                        bPoint;
                                    $.each(sortedPages, function (i) {
                                        if (this == "cross") {
                                            return true;
                                        }
                                        var crossed = $(this).data("type") == "cross" ? 2 : 1;

                                        transformB = transform.getCurrent(this);
                                        bPoint = { x: transformB.translationX + $(this).width() / 2, y: transformB.translationY + 35 };

                                        //碰撞检测
                                        if (Math.abs(aPoint.x - bPoint.x) < 70 * crossed && Math.abs(aPoint.y - bPoint.y) < 45 && curTar[0] !== this) {
                                            touchNum = i;
                                        }
                                    });


                                    return sortedPages;

                                })();

                                if (touchNum >= 0) {

                                    var hasDouble = function () {
                                        for (var i = Math.min(lastPageIndex, touchNum) ; i <= Math.max(lastPageIndex, touchNum) ; i++) {
                                            if (sortedPages[i] == "cross") continue;

                                            if ($(sortedPages[i]).data("type") == "cross") return true;
                                        }
                                        return false;
                                    }();

                                    if (hasDouble) {
                                        neighbor = sortedPages.splice(lastPageIndex % 2 == 1 && curTar.data("type") != "cross" ? lastPageIndex - 1 : lastPageIndex, 2)

                                        sortedPages.splice(touchNum % 2 == 1 ? touchNum - 1 : touchNum, 0, neighbor[0], neighbor[1]);
                                    } else {
                                        sortedPages.splice(lastPageIndex, 1);
                                        sortedPages.splice(touchNum, 0, curTar[0]);
                                    }
                                }
                                $.each(sortedPages, function () {
                                    var i = $.inArray("cross", sortedPages);
                                    if (i == -1) return false;
                                    sortedPages.splice(i, 1);
                                });
                                $.each(sortedPages, function () {
                                    if ($(this).data("page-seq") % 2 == 1 && $(this).data("type") == "cross") {
                                        console.log("数据错误")//$(this).data("page-nums"), $(this).data("type"))
                                        return;
                                    }
                                });
                            }

                            $pageSort.data('sortedPages', sortedPages);

                            sortedPages = $.makeArray($pageSortList.children('.page_item.sortable:first').prevAll()).reverse().concat($.makeArray(sortedPages)).concat($.makeArray($pageSortList.children('.page_item.sortable:last').nextAll()));

                            arrayPageListItems(sortedPages);

                            transform.translate(curTar, dragStartXY.x + e.deltaX, dragStartXY.y + $pageSortList.parent().scrollTop() + e.deltaY);

                            curTar.data('lastPageX', e.pageX);
                        }, 50));
                    });
                    draggableItem.dragEnd.register(function (e) {
                        setTimeout(function () {
                            var curTar = $(e.currentTarget);

                            var dragStartXY = curTar.data('dragStartXY');

                            transform.translate(curTar, dragStartXY.x + e.deltaX, dragStartXY.y + $pageSortList.parent().scrollTop() + e.deltaY);

                            setTimeout(function () {
                                curTar.removeClass('no-transition ignore-array');
                                var xy = curTar.data('xy');
                                transform.translate(curTar, xy.x, xy.y);
                                transform.scale(curTar, 1);
                            }, 100);
                        }, 100);
                    });
                }
            }
        });

    }

    function arrayPageListItems(items) {
        items = items || $pageSortList.children('li');

        items = $(items);

        var x = 0,
            y = 0,
            itemOuterWidth, itemOuterHeight;
        items.each(function (i, item) {
            item = $(item);
            itemOuterWidth = item.outerWidth(true);
            itemOuterHeight = item.outerHeight(true);
            if (x + itemOuterWidth > $pageSort.width()) {
                y += itemOuterHeight;
                x = 0;
            }
            item.css({
                left: 0,
                top: 0
            }).data('xy', {
                x: x,
                y: y
            });

            if (!item.hasClass('ignore-array')) {
                transform.translate(item, x, y);
            }

            x += itemOuterWidth;
        });
        $pageSortList.css('height', y + itemOuterHeight);
    }

    function init(bookInfo) {

        initPageSort(bookInfo);
    }

    function bind() {
        $pageSort.unbind('click').on('click', '.page-sort-type', function() {
            var type = $(this).attr('data-type');

            $('.page-sort-type').attr('data-select', false);
            $(this).attr('data-select', true);

            initPageSort(model.book.getBookInfo(), model.photo.getPhotos(), type);

        }).on('click', '.page-sort-save', function() {
            opEvent.eModeChange.trigger(exports, {
                from : "sort-page",
                to : "edit-book",
                args : {
                    save : true
                }
            })
        }).on('click', '.page-sort-cancel', function() {
            opEvent.eModeChange.trigger(exports, {
                from : "sort-page",
                to : "edit-book"
            })
        });
    }

    function getSortType() {
        return $('#page-sort .page-sort-type[data-select="true"]').attr('data-type');
    }

    function save() {
        var pageSortData = {};
        var sortedPages = $pageSort.data('sortedPages');
        if (sortedPages) {
            var startNum = 0;

            if (getSortType() == "single") {
                for (var i = 0, j = startNum; i < sortedPages.length; i++, j++) {
                    var sortedPage = $(sortedPages[i]);
                    var pageSeq = sortedPage.attr('data-page-seq').split(',')[0];
                    pageSortData[parseFloat(pageSeq)] = j;
                    if (sortedPage.attr('data-type') == "cross") {
                        j++;
                        pageSortData[parseFloat(pageSeq) + 1] = j;
                    }
                }
            } else {
                for (var i = 0, j = startNum; i < sortedPages.length; i++, j += 2) {
                    var sortedPage = $(sortedPages[i]);
                    var pageSeq = sortedPage.attr('data-page-seq').split(',')[0];
                    pageSortData[parseFloat(pageSeq)] = j;
                    pageSortData[parseFloat(pageSeq) + 1] = j + 1;
                }
            }

            //var selectedPageSeq = $('#page-list-preview').find('.page_thumbnail[aria-selected="true"]').attr('data-page-seq');
            opEvent.ePagesSort.trigger(exports, {
                sortData: pageSortData
            });

            //(function () {
            //    var initPage = 0;
            //    $.each(window.__model.book.get().page_list, function (i) {
            //        this.num = i + initPage;
            //        if (this.num % 2 == 1) {
            //            this.name = this.name.replace("left", "right");
            //        } else {
            //            this.name = this.name.replace("right", "left");
            //        }
            //    });
            //
            //})();

            //view.pagelist.setPageSelected(pageSortData[selectedPageSeq]);
            //
            //opEvent.ePageListItemSelected.trigger(exports, {
            //    currentPageSeqs: view.edit.getCurrentPageSeqs(),
            //    pageSeqs: view.edit.getCurrentPageSeqs(),
            //    selectedPageSeq: selectedPageSeq,
            //    force: "force"
            //});

            $pageSort.removeData('sortedPages');
        }
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {
        ePagesSort : new Event()
    };

    exports.initPageSort = function() {
        $('#page-sort .page-sort-type[data-type="double"]').trigger('click');
    };
    exports.save = save;

});
define('pagelist',['pageUtil','event'], function(require, exports, module) {

    var pageUtil = require('pageUtil');
    var Event = require('event');

    var $subPageList = $('#page-list-preview');
    var $pageListSelect = $('#page-list-select');

    function init(bookInfo) {

        var photos = model.photo.getPhotos();
        var isSubPageThumbnailOk = false;


        pageUtil.initPageList($subPageList, bookInfo, photos, "double", function() {
            isSubPageThumbnailOk = true;
            initPageListSelect();
        });

        $subPageList.maskLoading({
            time : 2000,
            //check : function() {
            //    return isSubPageThumbnailOk;
            //},
            load : function() {
                SureMsg.hideLoadBar();
                $subPageList.find('.page_item:first').trigger('click');

                if (!checkGuideShow())
                    editPageGuide();
            }
        });
    }

    function checkGuideShow() {
        var isEdit = $('body').attr('data-mode');

        if (isEdit == 'edit-book') {
            var isShow = SureDB.get("editGuideShow");
            return (isShow == true);
        } else {
            return true;
        }
    }

    function bind() {
        $('#footerPageList').unbind('click').on('click', '.page_control_header .act_btn', function() {
            //切换编辑模式
            var type = $(this).attr('data-type');
            if (!$(this).hasClass('selected')) {
                $('.page_control_header .act_btn').removeClass('selected');
                $(this).addClass('selected');

                var from = $('body').attr('data-mode');

                opEvent.eModeChange.trigger(exports, {
                    from : from,
                    to : type
                });
            }
        }).on('click', '.page_control .page_num', function() {
            //选择页码
            $(this).closest('.page_control').toggleClass('active');
        }).on('click', '.page_control #page-list-select > li', function() {
            var pageSeqs = $(this).attr('data-page-seq').split(',');
            var selectedPageSeq = pageSeqs[0];
            goto(selectedPageSeq);

            $('#footerPageList .page_control').removeClass('active');
        }).on('click', '.page_item', function(e) {

            var $this = $(this),
                pageSeqs = $this.attr('data-page-seq').split(',');

            var selectedPageSeq;
            if ($(e.target).hasClass('page_thumbnail')) {
                selectedPageSeq = $(e.target).attr('data-page-seq');
            } else {
                selectedPageSeq = pageSeqs[0];
            }

            if (checkSaved()) {
                opEvent.eBookSaving.trigger(exports, {});
            }

            var isRefresh = $('body').data('refresh');
            if (isRefresh == true) {
                $('body').data('refresh', false);
            }

            opEvent.ePageListItemSelected.trigger(exports, {
                currentPageSeqs: view.edit.getCurrentPageSeqs(),
                pageSeqs: pageSeqs,
                selectedPageSeq: selectedPageSeq,
                force : isRefresh == true ? "force" : ""
            });
        }).on('click', '.j-page-controller-pagination', function(e) {
            e.stopPropagation();
            e.preventDefault();

            var sender = $(this);
            goto(sender.attr('data-value'));
        }).on('click', '#addEmptyPage', function(e) {
            opEvent.ePopAddPage.trigger(exports, {});
        }).on('click', '#subDeletePages', function(e) {

            var curSeq = view.edit.getActivePageSeq();
            if (!SureUtil.isInteger(curSeq)) {
                SureMsg.error("当前页面不支持删除。");
                return;
            }

            SureMsg.confirm("确定删除当前编辑页面吗？", function() {
                opEvent.eDeletePages.trigger(exports, {
                    pageSeqs : view.edit.getCurrentPageSeqs()
                });
            })
        });
    }

    function refresh(book, photos, selectPageSeq, callback) {

        if (typeof selectPageSeq == 'function') {
            callback = selectPageSeq;
        }

        setTimeout(function () {
            var selectedPageSeq = selectPageSeq || getPageSelected().attr('data-page-seq');

            pageUtil.initPageList($subPageList, book, photos, 'double', function () {
                if (typeof callback === 'function') {
                    callback.call(exports);
                }
            });

            var left = 0;
            $subPageList.children('li').each(function (i, item) {
                left += $(item).outerWidth(true);
            });
            $subPageList.css('width', left + 6).scrollLeft(0);

            var pageThumbnail = $subPageList.find('.page_thumbnail[data-page-seq="' + selectedPageSeq + '"]');
            if (pageThumbnail.length === 0) {
                pageThumbnail = $subPageList.find('.page_thumbnail:first');
            }
            pageThumbnail.trigger('click');
        }, 100);
    }

    function goto(pageSeq) {
        if (pageSeq == "next") {
            var next = $subPageList.children('.page_item[aria-selected="' + true + '"]').next();
            if (next.length > 0) {
                next.trigger('click');
            }
        } else if (pageSeq == "prev") {
            var prev = $subPageList.children('.page_item[aria-selected="' + true + '"]').prev();
            if (prev.length > 0) {
                prev.trigger('click');
            }
        } else {
            $subPageList.find('.page_thumbnail[data-page-seq="' + pageSeq + '"]').trigger('click');
        }
    }

    function setPageSelected(pageSeq) {
        $subPageList.find('.page_thumbnail').attr('aria-selected', false)
            .filter('[data-page-seq=' + pageSeq + ']').attr('aria-selected', true)
            .parents('.page_item').attr('aria-selected', true)
            .siblings('.page_item').attr('aria-selected', false);

        var selectedItem = $subPageList.children('.page_item[aria-selected="true"]');

        $('#footerPageList .page_num').find('span').text(selectedItem.attr('data-text'));

        var selectedItemRect = selectedItem[0].getBoundingClientRect();
        var listPageWrapperRect = $subPageList.parent()[0].getBoundingClientRect();

        if (selectedItemRect.left < listPageWrapperRect.left) {
            $subPageList.stop(true, true).animate({
                scrollLeft: ('-=' + (listPageWrapperRect.left - selectedItemRect.left + selectedItemRect.width))
            });
        } else if (selectedItemRect.right > listPageWrapperRect.right) {
            $subPageList.stop(true, true).animate({
                scrollLeft: ('+=' + (selectedItemRect.right - listPageWrapperRect.right + selectedItemRect.width))
            });
        }
    }

    function getPageSelected() {
        return $subPageList.find('.page_thumbnail[aria-selected="true"]');
    }

    function checkSaved() {
        for (var key in window.changed) {
            return true;
        }
        return false;
    }

    function initPageListSelect() {
        var h = '';
        $subPageList.find('li').each(function() {
            var text = $(this).attr('data-text');
            var pageSeqs =  $(this).attr('data-page-seq');

            h += '<li data-page-seq="' + pageSeqs + '">' + text + '</li>';
        });

        $pageListSelect.empty().append(h);
    }

    var events = {
        eSetPageActive: new Event(),
        ePageListItemSelected : new Event(),
        eRefreshPage : new Event(),
        eDeletePages : new Event(),
        eRefreshAll : new Event()
    };

    function initEvent() {
        opEvent.eSetPageActive.register(function (e) {
            var pageSeq = e.pageSeq;

            setPageSelected(pageSeq);
        });

        opEvent.eDrawPageThumbnail.register(function (e) {
            var pageInfo = e.pageInfo,
                photos = e.photos,
                callback = e.callback,
                reDrawCurrentPages = e.reDrawCurrentPages;

            pageUtil.drawPageThumbnail($subPageList, pageInfo, photos, callback);
            if (reDrawCurrentPages && $('#section_book_edit > .page[data-seq="' + pageInfo.seq + '"]').length) {
                view.edit.initPageSlot(pageInfo, photos);
            }
        });

        opEvent.eRefreshAll.register(function (e) {
            var book = e.book;
            var photos = e.photos;
            var selSeq = e.selectPageSeq;

            $('body').data('refresh', true);

            refresh(book, photos, selSeq, function() {
                initPageListSelect();
            });
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;

    exports.refresh = refresh;
    exports.goto = goto;
    exports.setPageSelected = setPageSelected;
    exports.getPageSelected = getPageSelected;
});
define('edit',['size-converter','selection-handles','transform','draggable','zoombar','slot','imgload','event'], function(require, exports, module) {
    var SizeConverter = require('size-converter');
    var SelectionHandles = require('selection-handles');
    var transform = require('transform');
    var Draggable = require('draggable');
    var Zoombar = require('zoombar');
    var slot = require('slot');
    var imgload = require('imgload');
    var Event = require('event');

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
define('right',['slot','transform','draggable','event','size-converter'], function(require, exports, module) {

    var slot = require('slot');
    var transform = require('transform');
    var Draggable = require('draggable');
    var Event = require('event');
    var SizeConverter = require('size-converter');

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
define('left', function(require, exports, module) {

    function init() {

    }

    function bind() {
        //切换left aside
        $('.aside_left .left_tab a, .aside_left .sub_tab > a').click(function () {
            var type = $(this).attr('data-type');
            $(this).addClass('active').siblings().removeClass('active');
            $('.aside_left .tab_body[data-type=' + type + ']').addClass('active').siblings().removeClass('active')
            $('.aside_left .tab_body[data-type=' + type + ']').maskLoading({
                time : 600,
                bgColor : '#3f464d',
                //check : function() {
                //    return isSubPageThumbnailOk;
                //},
                load : function() {
                }
            });

            if (type == 'template') {
                view.leftTemplate.init();
            }
        });
        //
        //if (isTpl) {
        //    $('.aside_left .left_tab a[data-type="pageList"]').show().trigger('click');
        //} else {
        //    $('.aside_left .left_tab a[data-type="photo"]').trigger('click');
        //}
        $('.aside_left .left_tab a[data-type="photo"]').trigger('click');
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {};

});
define('mainv',['event'], function(require, exports, module) {

    var Event = require('event');

    var editMode = {
        edit : 'edit-book',
        sort : 'sort-page',
        preview : 'preview-book'
    };

    function init() {
        $('body').attr('data-type', editType);

        setEditMode(editMode.edit, editMode.edit);
        onEditescaleByWin();

        SureUtil.changeButtonCss();
    }

    function bind() {
        $('#switchSortpage').unbind('click').on('click', function() {
            //切换编辑模式
            var type = $(this).attr('data-type');
            $('.page_control_header .act_btn').removeClass('selected');
            $(this).addClass('selected');

            var from = $('body').attr('data-mode');

            opEvent.eModeChange.trigger(exports, {
                from : from,
                to : type
            });
        })
    }

    function initBookPreview() {

        $('body').attr({
            'data-bookscale-bottom': 'scalehide',
            'data-bookscale-left': 'scalehide',
            'data-bookscale-right': 'scalehide',
            'data-mode' : 'preview-book'
        });

        $('.preview-hide').hide();
    }

    /**
     * 设置整个页面的编辑模式
     *
     * 编辑模式包括：
     *      sort-page ： 页面排序
     *      edit-book ： 编辑书册
     *      preview-book ： 预览书册
     *
     * @param from  旧编辑模式
     * @param to    新编辑模式
     * @param args  参数
     */
    function setEditMode(from, to, args) {
        args = args || {};

        var onSuccess = args.onSuccess;

        $('body').attr('data-mode', to);

        if(editType == "create-tpl"){
            $('body').attr({
                'data-bookscale-bottom': 'scaleshow',
                'data-bookscale-left': 'scaleshow',
                'data-bookscale-right': 'scaleshow'
            });

            $('#pageEditMain .edit_box_tool').hide();
        } else if(editType == "user-edit"){
            $('body').attr({
                'data-bookscale-bottom': 'scaleshow',
                'data-bookscale-left': 'scaleshow'
            });
        } else if (editType == "user-preview") {
            initBookPreview();
        }


        switch (to) {
            case 'sort-page':
                view.pagesort.initPageSort();
                $('#switchSortpage').html('<span class="icon-th"></span>编辑模式').attr('data-type', "edit-book").attr('title', "编辑模式");
                $('#footerPageList .page_control_header .act_btn[data-type]').removeClass('selected');
                $('#changeEditModeToSortPage').addClass('selected');
                break;
            case 'edit-book':
                if (args && args.book) {

                    opEvent.eRefreshAll.trigger(exports, {
                        book: args.book,
                        photos : args.photos,
                        selectPageSeq : view.edit.getActivePageSeq()
                    });

                    //view.pagelist.refresh(args.book, args.photos, function () {
                    //    if (typeof onSuccess === 'function') {
                    //        onSuccess.call(exports);
                    //    }
                    //});
                }
                //else if (from === 'preview') {
                //    _pageListItemSelected.trigger(exports, {
                //        pageNums: $('#list_page .list_page-item[aria-selected="true"]').attr('data-page-nums').split(',')
                //    });
                //}
                $('#switchSortpage').html('<span class="icon-th"></span>列表模式').attr('data-type', "sort-page").attr('title', "列表模式");
                $('#footerPageList .page_control_header .act_btn[data-type]').removeClass('selected');
                $('#changeEditModeToEditBook').addClass('selected');
                break;
            case 'preview-book':
                if (from == 'preivew-book') {
                    $('body').attr({
                        'data-bookscale-bottom': 'scaleshow',
                        'data-bookscale-left': 'scaleshow',
                        'data-bookscale-right': 'scaleshow'
                    });
                } else {
                    $('body').attr({
                        'data-bookscale-bottom': 'scalehide',
                        'data-bookscale-left': 'scalehide',
                        'data-bookscale-right': 'scalehide'
                    });
                }

                break;
        }
        if (from == 'preview-book' || to == 'preview-book') {
            view.edit.resetBookScaleAndPosition();
        }
    }

    function initEvent() {
        opEvent.eModeChange.register(function(e) {
            var from = e.from,
                to = e.to,
                args = e.args || {};

            switch (from) {
                case 'sort-page':
                    if (args.save) {
                        view.pagesort.save();
                    }
                    break;
            }

            var book, photos;
            book = model.book.getBookInfo();
            photos = model.photo.getPhotos();

            switch (to) {
                case 'edit-book':
                    if (args.save) {
                        setEditMode(from, to, {
                            book: book,
                            photos: photos
                        });
                    } else {
                        setEditMode(from, to);
                    }
                    break;
                case 'sort-page':
                    setEditMode(from, to, {
                        book: book,
                        photos: photos
                    });
                    break;
                case 'preview-book':
                    setEditMode(from, to, {
                        book: book,
                        photos: photos
                    });
                    break;
            }
        });
    }

    function onEditescaleByWin() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        var bWidth = 1086, bHeight = 768;

        var cbody = $('body'),
            asideLeftLock = $('.aside_left_lock'),
            asideRightLock = $('.aside_right_lock'),
            footerLock = $('.footer_lock'),
            hideAside = $('#hideAside');

        showAndResign();
        //checkWindowSize();

        function hideLeft(){
            cbody.attr('data-bookscale-left', 'scalehide');
            asideLeftLock.attr('data-lock','true');
        }

        function hideRight(){
            cbody.attr('data-bookscale-right', 'scalehide');
            asideRightLock.attr('data-lock','true');
        }

        function showLeft(){
            cbody.attr('data-bookscale-left', 'scaleshow');
            asideLeftLock.attr('data-lock','false')
        }

        function showRight(){
            cbody.attr('data-bookscale-right', 'scaleshow');
            asideRightLock.attr('data-lock','false')
        }

        function hideFooter(){
            cbody.attr('data-bookscale-bottom', 'scalehide');
            footerLock.attr('data-lock','true');
        }

        function showFooter(){
            cbody.attr('data-bookscale-bottom', 'scaleshow');
            footerLock.attr('data-lock','false')
        }

        function showAndResign() {
            asideLeftLock.on('click', function (e) {
                e.preventDefault();
                var lock = asideLeftLock.attr('data-lock');
                if(lock == 'true'){
                    showLeft();
                }else if(lock == 'false'){
                    hideLeft();
                }
                view.edit.resetBookScaleAndPosition();
            });
            asideRightLock.on('click', function (e) {
                e.preventDefault();
                var lock = asideRightLock.attr('data-lock');
                if(lock == 'true'){
                    showRight();
                }else if(lock == 'false'){
                    hideRight();
                }
                view.edit.resetBookScaleAndPosition();
            });
            footerLock.on('click', function (e) {
                e.preventDefault();
                var lock = footerLock.attr('data-lock');
                if(lock == 'true'){
                    showFooter();
                }else if(lock == 'false'){
                    hideFooter();
                }
                view.edit.resetBookScaleAndPosition();
            });
            //显示/隐藏侧栏 底栏 待确定设计后再优化
            hideAside.on('click', function () {
                var select = $(this).attr('data-lock');
                if (select == "false") {
                    hideFooter();
                    hideLeft();
                    hideAside.attr('data-lock', true);
                } else {
                    showFooter();
                    showLeft();
                    hideAside.attr('data-lock', false);
                }
                view.edit.resetBookScaleAndPosition();
            });
        }

        function checkWindowSize(type) {
            if ((width <= bWidth && height <= bHeight) || height <= bHeight || width <= bWidth) {
                hideLeft();
            } else {
                showLeft();
                showFooter();
            }
            view.edit.resetBookScaleAndPosition();
        }
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {
        eModeChange : new Event()
    };
    exports.initEvent = initEvent;

    exports.setEditMode = setEditMode;
    exports.onEditescaleByWin = onEditescaleByWin;

});
define('canvas',['size-converter'], function(require, exports, module) {

    var SizeConverter = require('size-converter');
    var sizeConverter = new SizeConverter(108);

    function initUploader(pageInfo, cb, initToken) {
        return new SureIR.uploader({
            bucket: qiniu_book_bucket,
            domain: qiniu_book_domain,
            multi_selection: false,
            auto_start: true,
            progressText : '上传缩略图({0}%)...',
            initToken : initToken
        }, {
            'FilesAdded': function(up, files) {
            },
            'UploadProgress': function(up, file) {
            },
            'FileUploaded': function(up, file, info) {
                var res = $.parseJSON(info);
                var ir = SureIR.createIRFromQiniu(up, file, res, {});
                SureIR.addIR(ir, function(ret){
                    if (typeof(cb) == "function") {
                        cb(ret);
                    }
                });
            },
            'Key' : function(up, file) {
                var uuid = file.md5 || new UUID().id;
                return "thumbnail/" + App.data.bookId + "/" + pageInfo.seq + "/" + uuid;
            },
            'UploadComplete' : function(up) {
            }
        });
    }

    function generateThumbnail(pageInfo, photos, onComplate, dpi) {
        generatePreviewCanvas(pageInfo, photos, function(e) {
            var canvas = e.canvas;

            var uploader = initUploader(pageInfo, function(ir) {
                if (typeof onComplate === 'function') {
                    onComplate.call(exports, {ir: ir});
                }
            }, function(){
                var dataUrl = canvas.toDataURL();
                uploader.addLoaclImg(dataUrl);
            });
        }, dpi);
    }

    function generatePreviewCanvas(pageInfo, photos, onComplate, dpi) {
        var canvas = document.createElement('canvas');

        var previewSizeConverter = sizeConverter;
        if (dpi) {
            previewSizeConverter = new SizeConverter(dpi);
        }

        canvas.width = previewSizeConverter.mmToPx(pageInfo.width);
        canvas.height = previewSizeConverter.mmToPx(pageInfo.height);

        var context = canvas.getContext('2d');

        context.fillStyle = pageInfo.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (!pageInfo.decorationSlotList) pageInfo.decorationSlotList = [];
        if (!pageInfo.shapeSlotList) pageInfo.shapeSlotList = [];
        if (!pageInfo.shadingSlotList) pageInfo.shadingSlotList = [];

        var slots = pageInfo.imageSlotList.concat(pageInfo.textSlotList)
            .concat(pageInfo.decorationSlotList).concat(pageInfo.shapeSlotList)
            .concat(pageInfo.shadingSlotList);

        slots.sort(function (a, b) {
            return a.index - b.index;
        });

        if (slots.length === 0) {
            if (typeof onComplate === 'function') {
                onComplate.call(exports, {canvas: canvas});
            }
        } else {
            var curSlotIndex = 0;

            var judgeIsEnd = function () {
                if (curSlotIndex < slots.length) {
                    processOneSlot();
                } else if (curSlotIndex === slots.length) {
                    if (typeof onComplate === 'function') {
                        onComplate.call(exports, {canvas: canvas});
                    }
                }
            };

            var processOneSlot = function () {
                if ('image' in slots[curSlotIndex]) {
                    //图片框
                    var imgSlot = slots[curSlotIndex];
                    if (pageInfo.seq === 'copyright') {
                        if (['black', '#000000', '#000'].some(function (color) { return color === pageInfo.backgroundColor; })) {
                            if (imgSlot.name === 'imglogo') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        } else {
                            if (imgSlot.name === 'imglogoblackbg') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        }
                    }

                    var photo = null;
                    if (imgSlot.image) {
                        photo = model.photo.getById(imgSlot.image.id);
                    }

                    drawImgSlotOnCanvas({
                        context: context,
                        borderWidth: previewSizeConverter.ptToPx(imgSlot.borderWidth || 0),
                        borderColor: imgSlot.borderColor || '#ffffff',
                        width: previewSizeConverter.mmToPx(imgSlot.width),
                        height: previewSizeConverter.mmToPx(imgSlot.height),
                        x: previewSizeConverter.mmToPx(imgSlot.x),
                        y: previewSizeConverter.mmToPx(imgSlot.y),
                        rotation: imgSlot.rotation,
                        image: (imgSlot.image ? {
                            x: previewSizeConverter.mmToPx(imgSlot.image.x),
                            y: previewSizeConverter.mmToPx(imgSlot.image.y),
                            width: previewSizeConverter.mmToPx(imgSlot.image.width),
                            rotation: imgSlot.image.rotation
                        } : null),
                        themeImage: (imgSlot.themeImage ? {
                            x: previewSizeConverter.mmToPx(imgSlot.themeImage.x),
                            y: previewSizeConverter.mmToPx(imgSlot.themeImage.y),
                            width: previewSizeConverter.mmToPx(imgSlot.themeImage.width),
                            rotation: imgSlot.themeImage.rotation,
                            url: imgSlot.themeImage.url
                        } : null)
                    }, photo, function () {
                        curSlotIndex++;
                        judgeIsEnd();
                    });
                } else if ('content' in slots[curSlotIndex]) {
                    //文本框
                    var textSlot = slots[curSlotIndex];
                    drawTextSlotOnCanvas({
                        context: context,
                        width: previewSizeConverter.mmToPx(textSlot.width),
                        height: previewSizeConverter.mmToPx(textSlot.height),
                        x: previewSizeConverter.mmToPx(textSlot.x),
                        y: previewSizeConverter.mmToPx(textSlot.y),
                        content: textSlot.content,
                        rotation: textSlot.rotation,
                        fontId: textSlot.fontId,
                        px: previewSizeConverter.ptToPx(textSlot.pt),
                        color: textSlot.color || '#000',
                        align: textSlot.align,
                        lineheight: (textSlot.leading < 0 ? previewSizeConverter.ptToPx(textSlot.pt) * 1.2 : (sizeConverter.ptToPx(textSlot.leading))),
                        letterSpacing: ((textSlot.space / 1000) * previewSizeConverter.ptToPx(textSlot.pt))
                    });
                    curSlotIndex++;
                    judgeIsEnd();
                } else if ('src' in slots[curSlotIndex]) {
                    //挂件
                    var decorationSlot = slots[curSlotIndex];
                    if (pageInfo.seq === 'copyright') {
                        if (['black', '#000000', '#000'].some(function (color) { return color === pageInfo.backgroundColor; })) {
                            if (decorationSlot.name === 'imglogo') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        } else {
                            if (decorationSlot.name === 'imglogoblackbg') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        }
                    }
                    drawDecorationSlotOnCanvas({
                        context: context,
                        borderWidth: 0,
                        borderColor: '#ffffff',
                        width: previewSizeConverter.mmToPx(decorationSlot.width),
                        height: previewSizeConverter.mmToPx(decorationSlot.height),
                        x: previewSizeConverter.mmToPx(decorationSlot.x),
                        y: previewSizeConverter.mmToPx(decorationSlot.y),
                        rotation: decorationSlot.rotation,
                        src: (decorationSlot.src)
                    }, function () {
                        curSlotIndex++;
                        judgeIsEnd();
                    });

                    ////挂件
                    //var decorabox = slots[curSlotIndex];
                    //if (pageInfo.num === 'copyright') {
                    //    if (['black', '#000000', '#000'].some(function (color) { return color === pageInfo.backgroundColor; })) {
                    //        if (decorabox.name === 'imglogo') {
                    //            curSlotIndex ++;
                    //            judgeIsEnd();
                    //            return;
                    //        };
                    //    } else {
                    //        if (decorabox.name === 'imglogoblackbg') {
                    //            curSlotIndex ++;
                    //            judgeIsEnd();
                    //            return;
                    //        };
                    //    }
                    //}
                    //drawDecoraboxOnCanvas({
                    //    context: context,
                    //    border_width: 0,
                    //    border_color: '#ffffff',
                    //    width: previewSizeConverter.mmToPx(decorabox.width),
                    //    height: previewSizeConverter.mmToPx(decorabox.height),
                    //    x: previewSizeConverter.mmToPx(decorabox.x),
                    //    y: previewSizeConverter.mmToPx(decorabox.y),
                    //    rotation: decorabox.rotation,
                    //    src: decorabox.src,
                    //    color: decorabox.color,
                    //    type: decorabox.type,
                    //    timestamp: decorabox.timestamp
                    //}, function () {
                    //    curSlotIndex ++;
                    //    judgeIsEnd();
                    //});
                } else if ('color' in slots[curSlotIndex]) {
                    //色块
                    var shapeSlot = slots[curSlotIndex];
                    if (pageInfo.seq === 'copyright') {
                        if (['black', '#000000', '#000'].some(function (color) { return color === pageInfo.backgroundColor; })) {
                            if (shapeSlot.name === 'imglogo') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        } else {
                            if (shapeSlot.name === 'imglogoblackbg') {
                                curSlotIndex++;
                                judgeIsEnd();
                                return;
                            }
                        }
                    }
                    drawShapeSlotOnCanvas({
                        context: context,
                        borderWidth: shapeSlot.borderWidth,
                        opacity: shapeSlot.opacity,
                        color: shapeSlot.color,
                        borderColor: shapeSlot.borderColor,
                        width: previewSizeConverter.mmToPx(shapeSlot.width),
                        height: previewSizeConverter.mmToPx(shapeSlot.height),
                        x: previewSizeConverter.mmToPx(shapeSlot.x),
                        y: previewSizeConverter.mmToPx(shapeSlot.y),
                        rotation: shapeSlot.rotation
                    }, function () {
                        curSlotIndex++;
                        judgeIsEnd();
                    });

                } else　if (slots[curSlotIndex].name.indexOf('shading') >= 0) {
                    var shadingSlot = slots[curSlotIndex];
                    drawShadingSlotOnCanvas({
                        id: shadingSlot.id,
                        editUrl: shadingSlot.editUrl,
                        context: context,
                        width: previewSizeConverter.mmToPx(shadingSlot.width),
                        height: previewSizeConverter.mmToPx(shadingSlot.height),
                        x: previewSizeConverter.mmToPx(shadingSlot.x),
                        y: previewSizeConverter.mmToPx(shadingSlot.y),
                        rotation: shadingSlot.rotation,
                        imgWidth: previewSizeConverter.mmToPx(shadingSlot.imgWidth)
                    }, function () {
                        curSlotIndex++;
                        judgeIsEnd();
                    });
                }
            };

            judgeIsEnd();
        }
    }

    function drawImgSlotOnCanvas(args, photo, onComplate) {
        var context = args.context,
            width = args.width,
            height = args.height,
            x = args.x,
            y = args.y,
            rotation = args.rotation,
            borderWidth = args.borderWidth,
            borderColor = args.borderColor,
            image = args.image ? {
                x: args.image.x,
                y: args.image.y,
                width: args.image.width,
                rotation: args.image.rotation
            } : null,
            themeImage = args.themeImage ? {
                x: args.themeImage.x,
                y: args.themeImage.y,
                width: args.themeImage.width,
                rotation: args.themeImage.rotation,
                url: args.themeImage.url
            } : null;

        var draw = function (func) {
            context.save();

            context.translate(x + borderWidth + width / 2, y + borderWidth + height / 2);
            context.rotate(rotation * Math.PI / 180);
            context.translate(-width / 2, -height / 2);
            //context.roundRect(0, 0, width, height, 5, 5, 5, 5);
            context.strokeStyle = borderColor;
            context.lineWidth = borderWidth;
            context.strokeRect(-borderWidth / 2, -borderWidth / 2, width + borderWidth, height + borderWidth);
            context.beginPath();
            context.rect(0, 0, width, height);

            func();

            context.restore();
        };

        if ((!image || !photo) && !themeImage) {
            //没有照片  且没有固定图片的
            draw(function () {
                context.fillStyle = '#a1a1a1';
                context.fill();
            });
            if (typeof onComplate === 'function') {
                onComplate.call(this);
            }
        } else {
            //有照片
            var img = document.createElement('img');
            img.crossOrigin = "anonymous";
            img.onload = function () {
                draw(function () {
                    context.clip();

                    context.translate(image.x + image.width / 2, image.y + image.width / 2 * img.height / img.width);
                    var scale = image.width / img.width;
                    context.scale(scale, scale);
                    context.rotate(image.rotation * Math.PI / 180);
                    context.translate(-img.width / 2, -img.width / 2 * img.height / img.width);

                    context.drawImage(img, 0, 0);
                });

                img = null;

                if (typeof onComplate === 'function') {
                    onComplate.call(this);
                }
            };
            img.onerror = function () {
                img = null;
                if (typeof onComplate === 'function') {
                    onComplate.call(this);
                }
            };

            //img.src = convertEditSrcToThumbSrc(image.url);

            if (photo) {
                if (photo.ir.src) {
                    img.src = convertEditSrcToThumbSrc(photo.ir.src);
                }
                //else {
                //    generateEditImgDataURL(photo, function (e) {
                //        img.src = e.dataURL;
                //    });
                //}
            } else if (themeImage) {//主题固定图片的图片链接
                if (themeImage.url) {
                    img.src = convertEditSrcToThumbSrc(themeImage.url);
                }
            }
        }
    }

    function convertEditSrcToThumbSrc(editSrc) {
        return editSrc;
    }

    function drawTextSlotOnCanvas(args) {
        var context = args.context, //document.createElement('canvas').getContext('2d'),// args.context,
            width = args.width,
            height = args.height,
            x = args.x,
            y = args.y,
            content = args.content,
            rotation = args.rotation,
            fontId = args.fontId,
            px = args.px,
            color = args.color,
            align = args.align,
            lineheight = args.lineheight,
            letterSpacing = args.letterSpacing;

        context.save();

        context.font = px + 'px ' + getFontnameById(fontId) + ',font' + fontId;
        context.fillStyle = color;
        context.textAlign = align;
        context.textBaseline = 'middle';
        context.translate(x + width / 2, y + height / 2);
        context.rotate(rotation * Math.PI / 180);
        context.translate(-width / 2, -height / 2);

        context.beginPath();
        context.rect(0, 0, width, height);
        if (!content || content.length === 0) {
            //没有文字 画个灰色背景
            context.fillStyle = '#ccc';
            context.fill();
        } else {
            //有文字 画文字
            context.clip();

            context.translate(0, lineheight / 2);
            //context.rotate(Math.PI/6);
            switch (context.textAlign) {
                case 'center':
                    context.translate(width / 2, 0);
                    break;
                case 'right':
                    context.translate(width, 0);
                    break;
            }

            //匹配每一个word（规则与页面相同，一个全角字符为一个word，连续的半角字符或单个换行符为一个word）
            var regex = /([^\x00-\xff])|([\x00-\xff]+|\n)/g;
            var words = content && regex.test(content) ? content.match(regex) : [];

            var lineText = '',
                line = 0,
                lineWordIndex = 0;

            var i, j, len;

            for (i = 0, len = words.length; i < len; i++) {
                var word = words[i];

                if (word !== '\n' && (context.measureText(lineText + word).width + (lineText + word).length * letterSpacing <= width || (lineText + word).length === 1)) {
                    //不换行
                    lineText += word;
                    lineWordIndex++;
                    if (i < len - 1) {
                        continue;
                    }
                } else if (context.measureText(lineText + word).width + (lineText + word).length * letterSpacing > width) {
                    if (lineWordIndex === 0 && /^[\x00-\xff]+$/.test(word)) {
                        //超过文本框宽度的一行的完全的连续半角字符，折断
                        var letters = '';
                        for (j = 0; j < word.length; j++) {
                            var letter = word.charAt(j);
                            if (context.measureText(letters + letter).width + (letters + letter).length * letterSpacing <= width || (letters + letter).length === 1) {
                                letters += letter;
                            } else {
                                lineText = letters;
                                words[i] = word.substring(j);
                                break;
                            }
                        }
                    }
                    //要换行,i--让当前word在下一行打印
                    if (word !== '\n') {
                        i--;
                    }
                }

                //#region 绘制文字
                var startX = 0;
                var lineWidth = context.measureText(lineText).width + letterSpacing * lineText.length;
                switch (context.textAlign) {
                    case 'center':
                        startX = -(lineWidth) / 2;
                        break;
                    case 'right':
                        startX = -(lineWidth);
                        break;
                }
                for (j = 0; j < lineText.length; j++) {
                    var subStr = lineText.substring(0, j);
                    context.fillText(lineText[j], startX + context.measureText(subStr).width + letterSpacing * subStr.length, 0);
                }
                //#endregion

                lineText = '';
                lineWordIndex = 0;
                context.translate(0, lineheight);
                line++;
            }
        }

        context.restore();
    }

    function getFontnameById(id) {
        return fontPool.getFontName(id);
    }

    //TODO: 此处旋转之后的计算位置有BUG
    function drawDecorationSlotOnCanvas(args, onComplate) {
        var context = args.context,
            width = args.width,
            height = args.height,
            x = args.x,
            y = args.y,
            rotation = args.rotation,
            borderWidth = args.borderWidth,
            borderColor = args.borderColor,
            src = args.src;
        var draw = function (func) {
            context.save();

            context.beginPath();
            context.rect(x, y, width, height);

            func();
            context.restore();
        };

        //有照片
        var img = document.createElement('img');
        var imgsrc = src.replace("medium", "preview");
        //img = pic[imgsrc];
        img.crossOrigin = "anonymous";
        img.onload = function () {
            draw(function () {
                //创建剪切区域
                //context.clip();

                //定位旋转中心点
                //配饰x偏移 + 宽度的一半
                //配置y偏移 + 高度的一半
                context.translate(x + width / 2, y + height / 2);

                //旋转对应的角度
                context.rotate(rotation * Math.PI / 180);

                //定位画图片的起点
                var scale = width / img.width;
                var scaleH = height / img.height;
                context.scale(scale, scaleH);
                context.translate(-img.width / 2, -img.height / 2);

                context.drawImage(img, 0, 0);
            });

            if (typeof onComplate === 'function') {
                onComplate.call(this);
            }
        };
        img.onerror = function () {
            if (typeof onComplate === 'function') {
                onComplate.call(this);
            }
        };
        img.src = imgsrc;

    }

    //function drawDecoraboxOnCanvas(args, onComplate) {
    //    var context = args.context, //document.createElement('canvas').getContext('2d'),//args.context,
    //        width = args.width,
    //        height = args.height,
    //        x = args.x,
    //        y = args.y,
    //        rotation = args.rotation,
    //        border_width = args.border_width,
    //        border_color = args.border_color,
    //        src = args.src,
    //        color = args.color,
    //        type = args.type,
    //        timestamp = args.timestamp;
    //
    //    var draw = function (func) {
    //        context.save();
    //        context.beginPath();
    //        context.rect(x, y, width, height * 2);
    //
    //        func();
    //        context.restore();
    //    };
    //
    //    //有照片
    //    var img = document.createElement('img');
    //    var imgsrc = src.replace("medium", "preview");
    //    img.crossOrigin = "anonymous";
    //    img.onload = function () {
    //        draw(function () {
    //            context.clip();
    //
    //            context.translate(x + width / 2, y + height / 2 * img.height / img.width);
    //            var scale = width / img.width;
    //            context.scale(scale, scale);
    //            context.rotate(rotation * Math.PI / 180);
    //            context.translate(-img.width / 2, -img.width / 2 * img.height / img.width);
    //
    //            //可变色的
    //            if (type == 2 || type == 3) {
    //                changeMaterialColor({
    //                    img: img,
    //                    color: color,
    //                    callback: function(canvas){
    //                        context.drawImage(canvas, 0, 0);
    //                    }
    //                })
    //            }else{
    //                context.drawImage(img, 0, 0);
    //            }
    //        });
    //
    //        if (typeof onComplate === 'function') {
    //            onComplate.call(this);
    //        }
    //    };
    //    img.onerror = function () {
    //        if (typeof onComplate === 'function') {
    //            onComplate.call(this);
    //        }
    //    };
    //    img.src = imgsrc;
    //
    //}

    function changeMaterialColor(args){
        var img = args.img,
            color = args.color,
            callback = args.callback;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        //获取改变的区域，透明不取
        var imagedata = context.getImageData(0, 0, img.width, img.height);

        var _color = toRgb(color);

        //修改imagedata
        for (var i = 0, n = imagedata.data.length; i < n; i += 4) {
            imagedata.data[i + 0] = _color[0]; //r
            imagedata.data[i + 1] = _color[1]; //g
            imagedata.data[i + 2] = _color[2]; //b
            // imagedata.data[i + 3] = 149; //1
        }
        context.putImageData(imagedata, 0, 0);

        callback(canvas);
        context = null;
        canvas = null;
    }

    function toRgb(color){
        var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;

        var sColor = color.toLowerCase();
        if(sColor && reg.test(sColor)){
            if(sColor.length === 4){
                var sColorNew = "#";
                for(var i=1; i<4; i+=1){
                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
                }
                sColor = sColorNew;
            }
            //处理六位的颜色值
            var sColorChange = [];
            for(var i=1; i<7; i+=2){
                sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
            }
            return sColorChange;
        }else{
            return sColor;
        }
    }

    function drawShapeSlotOnCanvas(args, onComplate) {
        var context = args.context, //document.createElement('canvas').getContext('2d'),//args.context,
            width = args.width,
            height = args.height,
            x = args.x,
            y = args.y,
            rotation = args.rotation,
            borderWidth = args.borderWidth,
            borderColor = args.borderColor,
            opacity = args.opacity,
            color = args.color;

        var draw = function (func) {
            context.save();

            context.translate(x + borderWidth + width / 2, y + borderWidth + height / 2);
            context.rotate(rotation * Math.PI / 180);
            context.translate(-width/2, -height/2);
            context.roundRect(0, 0, width, height, 5, 5, 5, 5);
            context.strokeStyle = borderColor;
            context.lineWidth = borderWidth;
            context.strokeRect(-borderWidth / 2, -borderWidth / 2, width + borderWidth, height + borderWidth);
            context.beginPath();
            context.globalAlpha = opacity;
            context.rect(0, 0, width, height);

            func();

            context.restore();
        };

        //没有照片
        draw(function () {
            context.fillStyle = color;
            context.fill();
        });
        if (typeof onComplate === 'function') {
            onComplate.call(this);
        }
    }

    function drawShadingSlotOnCanvas(args, onComplate) {
        var context = args.context,
            id = args.id,
            thumbUrl = args.thumbUrl,
            editUrl = args.editUrl,
            width = args.width,
            height = args.height,
            rotation = args.rotation,
            x = args.x,
            y = args.y,
            imgWidth = args.imgWidth;

        //editUrl = "http://cdn-mimocampaign.mimoprint.com" + editUrl.replace(/Theme/, "theme").replace(/preview/, "image") + "@!w500";

        var img = document.createElement('img');
        img.crossOrigin = "anonymous";
        img.onload = function () {
            context.save();

            context.translate(x + width / 2, y + height / 2);
            context.rotate(rotation * Math.PI / 180);
            context.translate(-width / 2, -height / 2);
            context.beginPath();
            context.rect(0, 0, width, height);

            context.clip();
            context.drawImage(img, 0, 0, imgWidth, imgWidth * this.height / this.width);

            context.restore();

            img = null;

            if (typeof onComplate === 'function') {
                onComplate.call(this);
            }
        };
        img.onerror = function () {
            img = null;
            if (typeof onComplate === 'function') {
                onComplate.call(this);
            }
        };
        img.src = editUrl;
    }


    exports.generatePreviewCanvas = generatePreviewCanvas;
    exports.generateThumbnail = generateThumbnail;

    exports.drawImgSlotOnCanvas = drawImgSlotOnCanvas;
    exports.drawTextSlotOnCanvas = drawTextSlotOnCanvas;
    exports.drawDecorationSlotOnCanvas = drawDecorationSlotOnCanvas;
    exports.drawShapeSlotOnCanvas = drawShapeSlotOnCanvas;
    exports.drawShadingSlotOnCanvas = drawShadingSlotOnCanvas;
});

define('pageUtil',['size-converter','canvas'], function(require, exports, module) {

    var SizeConverter = require('size-converter');
    var canvasUtil = require('canvas');
    var sizeConverter = new SizeConverter(108);

    var templatePageItem = $('#template-page-item').html(),
        templatePageItemThumbnail = $('#template-page-item-thumbnail').html();

    function getPageList(book) {
        var pageList = [];

        for (var i = -5; i < book.innerPage.length + 2; i++) {
            var page = book.innerPage[i];

            if (i === -5) {
                if (!book.cover) {
                    continue;
                }
                page = book.cover;
            } else if (i === -4) {
                if (!book.spine) {
                    continue;
                }
                page = book.spine;

            } else if (i === -3) {
                if (!book.frontFlap) {
                    continue;
                }
                page = book.frontFlap;
            } else if (i === -2) {
                continue;
                if (!book.backFlap) {
                    continue;
                }
                page = book.backFlap;
            } else if (i === -1) {
                if (!book.flyleaf) {
                    continue;
                }
                page = book.flyleaf;
            } else if (i === book.innerPage.length) {
                if (!book.copyright) {
                    continue;
                }
                page = book.copyright;
            } else if (i === book.innerPage.length + 1) {
                if (!book.backCover) {
                    continue;
                }
                page = book.backCover;
            }

            pageList.push(page);
        }
        return pageList;
    }

    function initPageList($pageList, book, photos, sortType, onComplete) {

        $pageList.empty();

        var page, i;
        var pageSortList = getPageList(book);

        for (i = 0; i < pageSortList.length; i++) {
            page = pageSortList[i];
            var item = $(templatePageItem), preview = item.children('.page_preview');

            $pageList.append(item);

            var canvas1, canvas2;

            switch (page.type) {
                case "front-cover":
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '封面',
                        'data-width': page.width,
                        'data-type': 'front-cover'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-seq': (page.seq),
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    break;
                case "back-cover":
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '封底',
                        'data-width': page.width,
                        'data-type': 'back-cover'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-seq': (page.seq),
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    break;
                case "copyright":
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '版权页',
                        'data-width': page.width,
                        'data-type': 'copyright'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-seq': (page.seq),
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    break;
                case 'spine':
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '书脊',
                        'data-width': page.width,
                        'data-type': 'spine'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-seq': (page.seq),
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    break;
                case "flap":
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '折页',
                        'data-type': 'flap'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-num': 'frontFlap',
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    break;
                case 'flyleaf':
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': '1(扉页)',
                        'data-type': 'flyleaf'
                    });

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    preview.append(canvas1);
                    canvas1.attr({
                        'data-page-seq': page.seq,
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });

                    break;
                case 'normal':
                    if (sortType == "single") {
                        var newClass,
                            dataText,
                            pageSeq,
                            isLeft;
                        isLeft = parseFloat(page.seq) % 2 == 1;
                        dataText = parseFloat(page.seq) + (isLeft ? 1 : 2);
                        newClass = isLeft ? 'left_page' : 'right_page';
                        pageSeq = parseFloat(page.seq) + (isLeft ? 0 : 1);

                        item.attr({
                            'data-page-seq': page.seq,
                            'data-text': parseFloat(page.seq) + 2,
                            'data-width': page.width,
                            'data-type': 'normal'
                        }).addClass('sortable');

                        preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                        canvas1 = $(templatePageItemThumbnail);
                        preview.append(canvas1);
                        canvas1.addClass(newClass).attr({
                            'data-page-seq': (page.seq),
                            width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                            height: (preview.height())
                        });

                    } else {
                        if (page.seq !== "1") {
                            page.seq--;
                        }
                        item.attr({
                            'data-page-seq': [(parseFloat(page.seq) + 1), (parseFloat(page.seq) + 2)].join(),
                            'data-text': [parseFloat(page.seq) + 3, (parseFloat(page.seq) + 4)].join(' - '),
                            'data-type': 'normal'
                        }).addClass('sortable');

                        preview.width(sizeConverter.mmToPx(page.width) * 2 * (preview.height() / sizeConverter.mmToPx(page.height)));

                        canvas1 = $(templatePageItemThumbnail);
                        canvas2 = $(templatePageItemThumbnail);
                        preview.append(canvas1).append(canvas2);
                        canvas1.addClass('left_page').attr({
                            'data-page-seq': (parseFloat(page.seq) + 1),
                            width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                            height: (preview.height())
                        });
                        canvas2.addClass('right_page').attr({
                            'data-page-seq': (parseFloat(page.seq) + 2),
                            width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                            height: (preview.height())
                        });
                        if (page.seq !== "1") {
                            page.seq++;
                        }

                        i++;
                    }
                    break;
                case 'cross':
                    item.attr({
                        'data-page-seq': page.seq,
                        'data-text': [parseFloat(page.seq) + 2, (parseFloat(page.seq) + 3)].join(' - '),
                        'data-type': 'cross'
                    }).addClass('sortable');

                    preview.width(sizeConverter.mmToPx(page.width) * (preview.height() / sizeConverter.mmToPx(page.height)));

                    canvas1 = $(templatePageItemThumbnail);
                    canvas2 = $(templatePageItemThumbnail);
                    preview.append(canvas1).append(canvas2);
                    canvas1.attr({
                        'data-page-num': page.seq,
                        width: (sizeConverter.mmToPx(page.width) * preview.height() / sizeConverter.mmToPx(page.height)),
                        height: (preview.height())
                    });
                    canvas2.addClass('right_page').attr({
                        'data-page-seq': (parseFloat(page.seq) + 1),
                        width: 0,
                        height: (preview.height())
                    }).css('display', 'none');

                    i++;
                    break;
            }
        }

        $pageList.find('li').each(function() {
            var seqs = $(this).attr('data-page-seq');
            $(this).children('.page_num.right_page').remove();

            if (seqs == "front-cover" ) {
                $(this).children('.page_num.left_page').text("封面");
            } else if (seqs == "back-cover") {
                $(this).children('.page_num.left_page').text("封底");
            } else {
                seqs = seqs.split(",");
                if (seqs[1] != undefined) {
                    $(this).children('.page_num.left_page').text("P" + seqs[0] + "-" + seqs[1]);
                } else {
                    $(this).children('.page_num.left_page').text("P" + seqs[0]);
                }
            }
        });

        var complete = 0;

        var callback = function (e) {
            complete++;
            if (complete === $pageList.find('.page_thumbnail').length) {
                if (typeof onComplete === 'function') {
                    onComplete.call(this);
                }
            }
        };

        setTimeout(function(){
            for (i = 0; i < pageSortList.length; i++) {
                page = pageSortList[i];
                drawPageThumbnail($pageList, page, photos, callback);
            }
        }, 500);
    }

    function drawPageThumbnail($pageList, pageInfo, photos,  onSuccess) {

        var canvasThumbnail = $($pageList).find('canvas.page_thumbnail[data-page-seq=' + pageInfo.seq + ']')[0],
            preview = $(canvasThumbnail).parent(),
            item = preview.parent();

        if (!canvasThumbnail) {
            return;
        }

        var width = sizeConverter.mmToPx(pageInfo.width) * preview.height() / sizeConverter.mmToPx(pageInfo.height);
        if (Math.floor(canvasThumbnail.width) !== Math.floor(width)) {
            $(canvasThumbnail).attr({
                width: width
            });
        }

        switch (pageInfo.type) {
            case 'normal':
                var pages;
                if (pageInfo.seq % 2 === 1) {
                    pages = [(parseFloat(pageInfo.seq) - 1), pageInfo.seq];
                } else {
                    pages = [pageInfo.num, (parseFloat(pageInfo.seq) + 1)];
                    if (item.attr('data-type') === 'cross') {
                        $(canvasThumbnail).addClass('left_page').siblings('.page_thumbnail').css('display', 'block');
                        item.attr({
                            'data-page-nums': pages.join(),
                            'data-type': 'normal'
                        });
                    }
                }

                break;
            case 'cross':
                if (item.attr('data-type') === 'normal') {
                    item.attr({
                        'data-page-nums': pageInfo.num,
                        'data-type': 'cross'
                    });
                    $(canvasThumbnail).removeClass('left_page').siblings('.page_thumbnail').css('display', 'none');
                }

                break;
        }

        canvasUtil.generatePreviewCanvas(pageInfo, photos, function (e) {
            var canvas = e.canvas;

            var context = canvasThumbnail.getContext('2d');

            var resultCanvas = scaleImage(canvas, canvasThumbnail.width, canvasThumbnail.height);

            context.drawImage(resultCanvas, 0, 0);

            if (typeof onSuccess === 'function') {
                onSuccess.call(this, e);
            }
        }, 108);
    }

    function scaleImage(img, width, height) {
        var destCanvas = document.createElement('canvas');
        destCanvas.width = width;
        destCanvas.height = height;
        var destContext = destCanvas.getContext('2d');
        var tempCanvas = document.createElement('canvas');
        var max = 2500;
        if (img.width >= img.height) {
            tempCanvas.width = destCanvas.width * 3;
            if (tempCanvas.width > max) {
                tempCanvas.width = max;
            }
            tempCanvas.height = tempCanvas.width * img.height / img.width;
        } else {
            tempCanvas.height = destCanvas.height * 3;
            if (tempCanvas.height > max) {
                tempCanvas.height = max;
            }
            tempCanvas.width = tempCanvas.height * img.width / img.height;
        }

        var tempContext = tempCanvas.getContext('2d');
        tempContext.fillStyle = 'white';
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height); //此处缩放三次为双线性插值缩放算法，画质更好
        tempContext.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width / 2, tempCanvas.height / 2);
        destContext.drawImage(tempCanvas, 0, 0, tempCanvas.width / 2, tempCanvas.height / 2, 0, 0, destCanvas.width, destCanvas.height);

        return destCanvas;
    }

    function triggerDrawPageThumbnail(pageInfo, photos, reDrawCurrentPages, callback) {
        opEvent.eDrawPageThumbnail.trigger(exports, {
            pageInfo : pageInfo,
            photos : photos,
            reDrawCurrentPages : reDrawCurrentPages,
            callback : callback
        });
    }

    exports.initPageList = initPageList;
    exports.drawPageThumbnail = drawPageThumbnail;
    exports.scaleImage = scaleImage;
    exports.triggerDrawPageThumbnail = triggerDrawPageThumbnail;
    exports.getPageList = getPageList;
});
define('size-converter', function (require, exports, module) {
    function SizeConverter(dpi) {
        if (!dpi) {
            throw new Error('请给个dpi！');
        }
        this.DPI = dpi;
    }

    SizeConverter.prototype.mmToPx = function (mm) {
        return mm * this.DPI * (1 / 25.4);
    };

    SizeConverter.prototype.pxToMm = function (px) {
        return px / this.DPI / (1 / 25.4);
    };

    SizeConverter.prototype.mmToPt = function (mm) {
        return mm * (72 / 25.4);
    };

    SizeConverter.prototype.ptToMm = function (pt) {
        return pt * (25.4 / 72);
    };

    SizeConverter.prototype.ptToPx = function (pt) {
        return pt / 72 * this.DPI;
    };

    SizeConverter.prototype.pxToPt = function (px) {
        return px / this.DPI * 72;
    };

    module.exports = SizeConverter;
});
define('transform', function (require, exports, module) {
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
define('slot',['imageSlot','textSlot','decorationSlot','shadingSlot','shapeSlot','defaultSlot'], function (require, exports, module) {

    var imageSlot = require('imageSlot');
    var textSlot = require('textSlot');
    var decorationSlot = require('decorationSlot');
    var shadingSlot = require('shadingSlot');
    var shapeSlot = require('shapeSlot');

    var defaultSlot = require('defaultSlot');

    var _slotMaps = {
        imageslot : imageSlot,
        textslot : textSlot,
        decorationslot : decorationSlot,
        shadingslot : shadingSlot,
        shapeslot : shapeSlot,

        default : defaultSlot
    };

    function isImageSlot(el) {
        return el === "imageslot" || $(el).is('imageslot') || $(el).hasClass('imageslot');
    }

    function isTextSlot(el) {
        return el === "textslot" || $(el).is('textslot') || $(el).hasClass('textslot');
    }

    function isDecorationSlot(el) {
        return el === "decorationslot" || $(el).is('decorationslot') || $(el).hasClass('decorationslot');
    }

    function isShadingSlot(el) {
        return el === "shadingslot" || $(el).is('shadingslot') || $(el).hasClass('shadingslot');
    }

    function isShapeSlot(el) {
        return el === "shapeslot" || $(el).is('shapeslot') || $(el).hasClass('shapeslot');
    }

    function getImageSlotName() {
        return "imageslot";
    }

    function getTextSlotName() {
        return "textslot";
    }

    function getDecorationSlotName() {
        return "decorationslot";
    }

    function getShadingSlotName() {
        return "shadingslot";
    }

    function getShapeSlotName() {
        return "shapeslot";
    }

    function getAllSlotClass() {
        return ".textslot,.imageslot,.decorationslot,.shadingslot,.shapeslot";
    }

    function judgeSlotType(el) {
        if (isImageSlot(el)) {
            return getImageSlotName();
        } else if (isTextSlot(el)) {
            return getTextSlotName();
        } else  if (isDecorationSlot(el)) {
            return getDecorationSlotName();
        } else if (isShadingSlot(el)) {
            return getShadingSlotName();
        } else if (isShapeSlot(el)) {
            return getShapeSlotName();
        } else {
            return "default";
        }
    }

    function template(el) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.template();
    }

    function getAttr(el) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.getAttr(el);
    }

    function setAttr(el, attr) {
        var slot =  _slotMaps[judgeSlotType(el)];
        if (isLocked(el)) {
            if (attr.locked !== undefined){
                if (slot != null)
                    return slot.setAttr(el, attr);
            } else {
                SureMsg.error("请先解锁槽位!");
            }
        } else {
            if (slot != null)
                return slot.setAttr(el, attr);
        }
    }

    function create(type, info, args) {
        var slot =  _slotMaps[judgeSlotType(type)];
        if (slot != null)
            return slot.create(info, args);
    }

    function isEmpty(el) {
        var slot = _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.isEmpty(el);
    }

    function isLocked(el) {
        var slot = _slotMaps[judgeSlotType(el)];
        if (slot != null)
            return slot.isLocked(el);
    }

    exports.template = template;
    exports.getAttr = getAttr;
    exports.setAttr = setAttr;
    exports.create = create;
    exports.isEmpty = isEmpty;
    exports.isLocked = isLocked;

    exports.slotType = judgeSlotType;
    exports.isImageSlot = isImageSlot;
    exports.isTextSlot = isTextSlot;
    exports.isDecorationSlot = isDecorationSlot;
    exports.isShadingSlot = isShadingSlot;
    exports.isShapeSlot = isShapeSlot;

    exports.getImageSlotName = getImageSlotName;
    exports.getTextSlotName = getTextSlotName;
    exports.getDecorationSlotName = getDecorationSlotName;
    exports.getShadingSlotName = getShadingSlotName;
    exports.getShapeSlotName = getShapeSlotName;

    exports.getAllSlotClass = getAllSlotClass;


    exports.image = imageSlot;
    exports.text = textSlot;
    exports.decoration = decorationSlot;
    exports.shading = shadingSlot;
    exports.shape = shapeSlot;

});
define('pool',['md5','material'], function (require, exports, module) {
    var md5 = require('md5');
    var material = require('material');

    function Pool(type) {

        this.user = [];
        this.admin = [];

        this.tags = [];
        this.datasByTag = {};

        this.styles = [];
        this.datasByStyle = {};

        var me = this;

        material.getByType(type, 0, -1, function(user) {
            me.user = user.data;
        });
        material.getAdminByType(type, 0, -1, function(admin) {
            me.admin = admin.data;
            me.analysis();
        });
    }

    Pool.prototype.analysis = function() {
        var datas = this.admin;
        var me = this;
        $.each(datas, function(i, data) {
            var tag = data.tag;
            var style = data.style;

            if (tag != null) {
                tag = tag.split(',');
            } else {
                tag = [];
            }
            $.each(tag, function(j,t) {
                if ($.inArray(t, me.tags) < 0) {
                    me.tags.push(t);
                }
                var tagDatas = me.datasByTag[t];
                if (tagDatas == undefined) {
                    me.datasByTag[t] = [];
                }
                me.datasByTag[t].push(data);
            });

            if (style != null) {
                style = style.split(',');
            } else {
                style=[];
            }
            $.each(style, function(j,s) {
                if ($.inArray(s, me.styles) < 0) {
                    me.styles.push(s);
                }
                var styleDatas = me.datasByStyle[s];
                if (styleDatas == undefined) {
                    me.datasByStyle[s] = [];
                }
                me.datasByStyle[s].push(data);
            });
        });
    };

    Pool.prototype.getByTag = function(tag) {
        if (tag == "全部" || tag == "all") {
            return this.admin;
        } else {
            var find =  this.datasByTag[tag];
            if (find != undefined) {
                return find;
            } else {
                return [];
            }
        }
    };

    Pool.prototype.getByStyle = function(style) {
        var find =  this.datasByStyle[style];
        if (find != undefined) {
            return find;
        } else {
            return [];
        }
    };

    Pool.prototype.getUser = function() {
        return this.user;
    };

    Pool.prototype.getAdmin = function() {
        return this.admin;
    };

    Pool.prototype.add = function(material) {
        if (material.level == 'U') {
            this.user.unshift(material);
        } else {
            this.admin.unshift(material);
        }
    };

    Pool.prototype.del = function(id) {
        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.id == id) {
                this.user.splice(i, 1);
            }
        }
    };

    Pool.prototype.getById = function(id)  {
        var find = this.getUserById(id);
        if (find == null) {
            find = this.getAdminById(id);
        }
        return find;
    };

    Pool.prototype.getAdminById = function(id)  {

        for (var i = 0; i < this.admin.length; i ++) {
            var de = this.admin[i];
            if (de.id == id) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.getUserById = function(id)  {

        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.id == id) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.getUserByCode = function(md5) {

        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.code == md5) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.isExist = function(file, bookId, existCb, noExistCb) {
        var me = this;
        md5.calMd5(file, function (md5) {
            var bg = me.getUserByCode(md5);
            if (bg != null) {
                if (typeof(existCb) === "function")existCb(bg);
            } else {
                if (typeof(noExistCb) === "function")noExistCb(md5);
            }
        });
    };

    module.exports = Pool;
});
define('md5', function(require, exports, module) {
    var calMd5 = function (file, cb) {

        try {
            //文件分割方法（注意兼容性）
            var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;

            //最小需要截取部分进行MD5计算的文件大小 1MB
            var minNeedSliceSize = 1048576;

            //取前后及中间多少字节进行MD5计算
            var len = 50;

            var blob;
            if (minNeedSliceSize < file.size) {
                var file1 = blobSlice.call(file, 0, len);
                var file2 = blobSlice.call(file, file.size / 2 - len, file.size / 2 + len);
                var file3 = blobSlice.call(file, file.size - len, file.size);
                blob = new Blob([file1, file2, file3])
            } else {
                blob = new Blob([blobSlice.call(file, 0, file.size)]);
            }

            var fileReader = new FileReader();
            //创建md5对象（基于SparkMD5）
            var spark = new SparkMD5();
            fileReader.onload = function (e) {
                spark.appendBinary(e.target.result);
                var md5 = spark.end();
                if (typeof(cb) === "function") {
                    cb(md5);
                }
            };

            fileReader.readAsDataURL(blob);
        } catch (e) {
            console.log(e);
            this.calMd5_fullFile(file, cb);
        }

    };
    var calMd5FullFile =  function (file, cb) {
        //文件分割方法（注意兼容性）
        var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
        //2M分割
            chunkSize = 2097152,
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,

        //创建md5对象（基于SparkMD5）
            spark = new SparkMD5();

        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            //每块交由sparkMD5进行计算
            spark.appendBinary(e.target.result);
            currentChunk++;

            //如果文件处理完成计算MD5，如果还有分片继续处理
            if (currentChunk < chunks) {
                loadNext();
            } else {
                var md5 = spark.end();
                if (typeof(cb) === "function") {
                    cb(md5);
                }
            }
        };
        //处理单片文件的上传
        function loadNext() {
            var start = currentChunk * chunkSize, end = start + chunkSize >= file.size ? file.size : start + chunkSize;

            if ("readAsBinaryString" in fileReader)
                fileReader.readAsBinaryString(blobSlice.call(file, start, end));
            else
                fileReader.readAsText(blobSlice.call(file, start, end));
        }

        loadNext();
    };

    exports.calMd5 = calMd5;
    exports.calMd5FullFile = calMd5FullFile;
});
define('index',['size-converter','book','photo'], function (require, exports, module) {
    var SizeConverter = require('size-converter');

    return {
        book : require('book'),
        photo : require('photo'),
        definitionSizeConverter: new SizeConverter(250)
    };
});
define('opEvent', function (require, exports, module) {

    var _event = {};

    function addEvent(events) {
        $.extend(exports, events);
        _event = exports;
    }

    function getEvent(event) {
        var te = _event[event];
        if (te != undefined) {
            return te;
        } else {
            throw Error( event + " 不存在");
        }
    }

    function triggerEvent(event, args) {
        var te = getEvent(event);
        te.trigger(exports, args);
    }

    function registerEvent(event, func) {
        var te = getEvent(event);
        te.register(func);
    }

    exports.add = addEvent;
    exports.get = getEvent;
    exports.trigger = triggerEvent;
    exports.register = registerEvent;
});
define('view',['mainv','left','right','edit','pagelist','pagesort','toptool','upload','addPage','leftPhoto','leftPageList','leftDecoration','leftBackground','leftTemplate'], function (require, exports, module) {
    var mainv = require('mainv');
    var left = require('left');
    var right = require('right');
    var edit = require('edit');
    var pagelist = require('pagelist');
    var pagesort = require('pagesort');
    var toptool = require('toptool');
    var upload = require('upload');
    var addPage = require('addPage');
    var leftPhoto = require('leftPhoto');
    var leftPageList = require('leftPageList');
    var leftDecoration = require('leftDecoration');
    var leftBackground = require('leftBackground');
    var leftTemplate = require('leftTemplate');

    var allView = [mainv, left, right, edit, pagelist, pagesort, toptool,
        upload, addPage,
        leftPhoto, leftDecoration, leftBackground, leftTemplate];

    //如果是模板则加入侧边栏书页
    //if (isTpl)
    //    allView.push(leftPageList);

    function init(bookInfo) {

        allView.each(function(v) {

            v.init(bookInfo);

            if (typeof v.bind == 'function')
                v.bind();

            if (typeof v.events != 'undefined')
                opEvent.add(v.events);
        });
        allView.each(function(v) {
            if (typeof v.initEvent == 'function')
                v.initEvent();
        });

    }

    exports.init = init;

    exports.index = mainv;
    exports.edit = edit;
    exports.left = left;

    exports.leftPhoto = leftPhoto;
    exports.leftDecoration = leftDecoration;
    exports.leftPageList = leftPageList;
    exports.leftDecoration = leftDecoration;
    exports.leftBackground = leftBackground;
    exports.leftTemplate = leftTemplate;

    exports.right = right;
    exports.toptool = toptool;
    exports.pagelist = pagelist;
    exports.pagesort = pagesort;

    exports.upload = upload;

});

define('presenter',['slot','transform','size-converter','pageUtil','canvas'], function (require, exports, module) {
    var slot = require('slot');
    var transform = require('transform');
    var SizeConverter = require('size-converter');
    var pageUtil = require('pageUtil');
    var canvasUtil = require('canvas');

    var sizeConverter = new SizeConverter(108);

    function init() {

        opEvent.eCopySlots.register(function (e) {
            var slots = e.slots;

            model.book.slotsClipboard = slots.map(function (slotInfo) {
                switch(slotInfo.type) {
                    case slot.getImageSlotName():
                        slotInfo.slot = model.book.getImageSlotByPageSeqAndName(slotInfo.pageSeq, slotInfo.name);
                        break;
                    case slot.getDecorationSlotName():
                        slotInfo.slot = model.book.getDecorationSlotByPageSeqAndName(slotInfo.pageSeq, slotInfo.name);
                        break;
                    case slot.getShapeSlotName():
                        slotInfo.slot = model.book.getShapeSlotByPageSeqAndName(slotInfo.pageSeq, slotInfo.name);
                        break;
                    case slot.getTextSlotName():
                        slotInfo.slot = model.book.getTextSlotByPageSeqAndName(slotInfo.pageSeq, slotInfo.name);
                        break;
                    case slot.getShadingSlotName():
                        slotInfo.slot = model.book.getShadingSlotByPageSeqAndName(slotInfo.pageSeq, slotInfo.name);
                        break;
                }
                return slotInfo;
            });
        });

        opEvent.eCutSlots.register(function (e) {
            var slots = e.slots;

            opEvent.eCopySlots.trigger(exports, { slots: slots });
            opEvent.eSlotsRemove.trigger(exports, { slots: slots });
        });

        opEvent.ePasteSlots.register(function (e) {
            var destPageSeq = e.destPageSeq;
            var x = e.x;
            var y = e.y;

            var newSlot = model.book.pasteSlots(destPageSeq, x, y);

            if (!newSlot)
                return;

            var page = model.book.getPageBySeq(destPageSeq);
            var photos = model.photo.getPhotoInPage(page);
            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page);

            checkPageHistory(destPageSeq);
        });


        opEvent.eAddPage.register(function(e) {
            var addPageNum = e.addPageNum;
            var addPostion = e.addPostion;
            var curSeq = view.edit.getActivePageSeq();

           model.book.addPages(addPageNum, addPostion, curSeq);

            opEvent.eRefreshAll.trigger(exports, {
                book: model.book.get(),
                photos : model.photo.getPhotos(),
                selectPageSeq : curSeq
            });
        });

        opEvent.eDeletePages.register(function (e) {
            var delPageSeqs = e.pageSeqs;
            var selectPageSeq = model.book.delPages(delPageSeqs);

            opEvent.eRefreshAll.trigger(exports, {
                book: model.book.get(),
                photos : model.photo.getPhotos(),
                selectPageSeq : selectPageSeq
            })
        });

        opEvent.eTemplateListItemSelected.register(function (e) {
            var currentPageSeq = e.currentPageSeq,
                template = e.template;
                //editorStatus = e.editorStatus,
                //isFixImageTheme = e.isFixImageTheme;

            var page = model.book.getPageBySeq(currentPageSeq);
                //template = model.template.getMyTempByname(templateName);

            changePageData({
                page: page,
                template: template
                //templateName: templateName,
                //editorStatus: editorStatus,
                //isFixImageTheme: isFixImageTheme
            });
        });

        opEvent.eSaveAsTemplate.register(function(e) {
            var pageSeq = e.pageSeq;

           model.book.saveMyTemplate(pageSeq, function(pt) {
               templatePool.add(pt);
               view.leftTemplate.init();
               SureMsg.success("模板保存成功");
            });
        });

        opEvent.eSetPageActive.register(function (e) {
            var pageSeq = e.pageSeq;

            checkPageHistory(pageSeq);
        });

        opEvent.eChangeBookInfo.register(function(e) {
           model.book.update(e.book);
            if (e.refresh) {
                opEvent.eBookSaving.trigger(exports, {
                    refresh : e.refresh
                });
            }
        });

        opEvent.eChangePageInfo.register(function(e) {
            var seq = e.seq;
            var type = e.type;
            var value = e.value;
            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');

                if (type == 'backgroundColor') {
                    sender.attr({
                        'data-value': value
                    }).children('span').css({
                        'background-color': value
                    });
                }
            }

            var page = model.book.getPageBySeq(seq);

            page[type] = value;

            var photos = model.photo.getPhotoInPage(page);
            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page);

        });

        //触发页面撤销
        opEvent.ePageUndo.register(function (e) {

            var pageSeq = e.pageSeq;

            var page = model.book.undo(pageSeq);

            if (!page) {
                return;
            }

            var pages;
            switch (page.type) {
                case 'normal':
                    if (page.seq % 2 === 1) {
                        pages = [model.book.getPageBySeq(page.seq - 1), page];
                    } else {
                        pages = [page, model.book.getPageBySeq(parseInt(page.seq) + 1)];
                    }
                    break;
                case 'back-flap':
                    pages = [page, model.book.getPageBySeq('back-flap')];
                    break;
                case 'front-flap':
                    pages = [model.book.getPageBySeq('front-flap'), page];
                    break;
                default:
                    pages = [page];
                    break;
            }

            var photos = model.photo.getPhotoInPage(pages);

            view.edit.render(pages, photos, true);
            view.edit.setPageActive(page.seq);

            pageUtil.triggerDrawPageThumbnail(page, pages);

            //countAllPhotosUsedNum();
            //
            checkPageHistory(pageSeq);
            //view.fabricsCoverPatch();
        });

        opEvent.ePageRedo.register(function (e) {
            var pageSeq = e.pageSeq;
            var page = model.book.redo(pageSeq);

            if (!page) {
                return;
            }

            var pages;
            switch (page.type) {
                case 'normal':
                    if (page.num % 2 === 1) {
                        pages = [model.book.getPageBySeq(page.seq - 1), page];
                    } else {
                        pages = [page, model.book.getPageBySeq(parseInt(page.seq) + 1)];
                    }
                    break;
                case 'back-flap':
                    pages = [page, model.book.getPageBySeq('back-flap')];
                    break;
                case 'front-flap':
                    pages = [model.book.getPageBySeq('front-flap'), page];
                    break;
                default:
                    pages = [page];
                    break;
            }

            var photos = model.photo.getPhotoInPage(pages);
            view.edit.render(pages, photos, true);

            view.edit.setPageActive(page.seq);
            pageUtil.triggerDrawPageThumbnail(page, photos);

            //countAllPhotosUsedNum();
            //
            checkPageHistory(pageSeq);
            //view.fabricsCoverPatch();
        });

        //页排序
        opEvent.ePagesSort.register(function (e) {
            var sortData = e.sortData;

            model.book.sortPages(sortData);
        });

        opEvent.eNewDecorationInsert.register(function(e) {
            var pageSeq = e.pageSeq,
                decoration = e.decoration,
                x = e.x, y = e.y;

            var img = document.createElement('img');
            img.src = decoration.value;
            img.onload = function () {
                var ow = model.definitionSizeConverter.pxToMm(img.width);
                var oh = model.definitionSizeConverter.pxToMm(img.height);
                var nw = 35, nh;
                nh = (oh * nw) / ow;

                var decoraSlot = model.book.insertDecorationSlot(pageSeq, decoration, nw, nh, x, y);

                var page = model.book.getPageBySeq(pageSeq),
                    photos = model.photo.getPhotoInPage(page);

                view.edit.initPageSlot(page, photos);
                pageUtil.triggerDrawPageThumbnail(page);
                view.edit.selectSlot(pageSeq, decoraSlot.name);

                initUndoRedoBtn();
            };
        });

        opEvent.eNewImageSlotInsert.register(function (e) {

            var pageSeq = e.pageSeq || view.edit.getActivePage().attr('data-seq'),
                obj = e.obj;

            var imageSlot = model.book.insertImageSlot(pageSeq, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page);
            view.edit.selectSlot(pageSeq, imageSlot.name);
        });

        opEvent.eMewTextSlotInsert.register(function (e) {

            var pageSeq = e.pageSeq || view.edit.getActivePage().attr('data-seq'),
                obj = e.obj;

            var textSlot = model.book.insertTextSlot(pageSeq, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.selectSlot(pageSeq, textSlot.name);

            initUndoRedoBtn();
        });

        opEvent.eNewShapeSlotInsert.register(function (e) {
            var pageSeq =  e.pageSeq || view.edit.getActivePage().attr('data-seq'),
                obj = e.obj;

            var shapeSlot = model.book.insertShapeSlot(pageSeq, {
                borderColor: '',
                borderWidth: 0,
                color: '#2db572',
                opacity: 1,
                w: 25,
                h: 25
            });

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.selectSlot(pageSeq, shapeSlot.name);

            initUndoRedoBtn();
        });

        opEvent.eBookAutoComplete.register(function (e) {
            SureMsg.success("自动排版");
        });

        opEvent.eBookCheck.register(function (e) {
            SureMsg.success("检查书册");
        });

        opEvent.eBookSaving.register(function (e) {
            var activePageSeq = view.edit.getActivePageSeq();
            model.book.saveChanges(function() {
                SureMsg.success("保存书册");
                checkPageHistory(activePageSeq);

                if (e.refresh != undefined && e.refresh) {
                    SureUtil.refresh();
                }

            }, function() {
                SureMsg.error("更新失败");
            });

            //更新页面缩略图
            if (e.updateThumbnail == undefined || e.updateThumbnail) {
                var page = model.book.getPageBySeq(activePageSeq);
                var photos = model.photo.getPhotoInPage(page);
                canvasUtil.generateThumbnail(page, photos, function(e) {
                    var ir = e.ir;
                    model.book.updateThumbnail(activePageSeq, ir.src);
                    model.book.saveChanges();
                }, 108);
            }
        });

        opEvent.eBookPublish.register(function (e) {
            var isCreateThumb = e.isCreateThumb;
            var onSuccess = e.onSuccess;

            model.book.publish(isCreateThumb, function() {
                SureMsg.success("发布书册成功");
                if (typeof onSuccess == 'function') {
                    onSuccess();
                }
            }, function() {
                SureMsg.error("更新失败");
            });
        });

        opEvent.ePageListItemSelected.register(function(e) {
            var currentPageSeqs = e.currentPageSeqs,
                pageSeqs = e.pageSeqs,
                selectedPageSeq = e.selectedPageSeq,
                force = e.force;

            if (pageSeqs === undefined) {
                throw new Error('pageSeqs为undefined');
            }
            if (selectedPageSeq === undefined) {
                selectedPageSeq = pageSeqs[0];
            }

            var pages = [];
            for (var i = 0; i < pageSeqs.length; i++) {
                var page = model.book.getPageBySeq(pageSeqs[i]);
                pages.push(page);
            }

            var photos = model.photo.getPhotoInPage(pages);

            if (force == "force") {
                view.edit.render(pages, photos, false, selectedPageSeq); //渲染
            }

            if (!currentPageSeqs || currentPageSeqs.join() !== pageSeqs.join()) {
                view.edit.render(pages, photos, false, selectedPageSeq); //渲染
            } else {
                if (selectedPageSeq) {
                    view.edit.setPageActive(selectedPageSeq);
                }
            }
        });

        opEvent.eSlotChanged.register(function(e) {
            var el = $(e.el);
            switch (slot.slotType(el)) {
                case 'imageslot':
                    onImageSlotChanged(e);
                    break;
                case 'textslot':
                    onTextSlotChanged(e);
                    break;
                case 'decorationslot':
                    onDecorationSlotChanged(e);
                    break;
                case 'shapeslot':
                    onShapeSlotChanged(e);
                    break;
                case 'shadingslot':
                    onShadingSlotChanged(e);
                    break;
            }

            var selectionHandles = el.data('selectionHandles');
            if (selectionHandles != null && selectionHandles.isOn) {
                selectionHandles.resetPosition();
            }

            checkPageHistory();
        });

        function onImageSlotChanged(e) {
            var pageSeq = e.pageSeq,
                slotName = e.name,
                obj = e.obj;

            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (slotName === undefined) {
                throw new Error('imageSlotName为undefined');
            }
            if (obj === undefined) {
                throw new Error('obj为undefined');
            }

            //if (obj.image === null) {
            //    var imageSlot = model.book.getImgboxByPageNumAndName(pageSeq, imageSlotName);
            //    if (imageSlot.image && imageSlot.image.id) {
            //        var photo = model.Photo.findById(imageSlot.image.id);
            //        photo.usedCount--;
            //        view.photoManager.setUsedCount(photo.id, photo.usedCount);
            //    }
            //}

            model.book.updateImageSlot(pageSeq, slotName, true, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.setPageActive(pageSeq);

            //更新左侧的照片资源
            view.leftPhoto.initPhoto();
        }

        function onTextSlotChanged(e) {
            var pageSeq = e.pageSeq,
                name = e.name,
                saveToHistory = e.saveToHistory !== false,
                obj = e.obj;

            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (name === undefined) {
                throw new Error('namee为undefined');
            }
            if (obj === undefined) {
                throw new Error('obj为undefined');
            }

            if (pageSeq === 'front-cover' && obj.content !== undefined) {
                //这块代码是同步封面和扉页和版权页的文字

            } else if (pageSeq === 'spine' && name === 'txt1' && obj.content !== undefined) {
                //更新书册名称
                //var bookname = model.book.get().name;
                //var oldContent = model.book.getTextboxByPageNumAndName(pageSeq, textboxName).content;
                //if (bookname.length === 0 || bookname === '我的照片书' || oldContent.replace(/[\r\n]/g, '') === bookname) {
                //    model.book.get().name = obj.content.replace(/[\r\n]/g, '');
                //    view.setBookName(model.book.get().name);
                //}
            }

            model.book.updateTextSlot(pageSeq, name, saveToHistory, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);
            pageUtil.triggerDrawPageThumbnail(page, photos);

            view.edit.setPageActive(pageSeq);
        }

        function onDecorationSlotChanged(e) {
            var pageSeq = e.pageSeq,
                name = e.name ,
                saveToHistory = e.saveToHistory !== false,
                obj = e.obj;

            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (name === undefined) {
                throw new Error('name为undefined');
            }
            if (obj === undefined) {
                throw new Error('obj为undefined');
            }


            model.book.updateDecorationSlot(pageSeq, name, saveToHistory, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.setPageActive(pageSeq);
        }

        function onShapeSlotChanged(e) {
            var pageSeq = e.pageSeq;
            var name = e.name;
            var saveToHistory = e.saveToHistory !== false;
            var obj = e.obj;

            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (name === undefined) {
                throw new Error('name为undefined');
            }
            if (obj === undefined) {
                throw new Error('obj为undefined');
            }

            model.book.updateShapeSlot(pageSeq, name, saveToHistory, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.setPageActive(pageSeq);
        }

        function onShadingSlotChanged(e) {
            var pageSeq = e.pageSeq;
            var name = e.name;
            var saveToHistory = e.saveToHistory !== false;
            var obj = e.obj;

            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (name === undefined) {
                throw new Error('name为undefined');
            }
            if (obj === undefined) {
                throw new Error('obj为undefined');
            }

            model.book.updateShadingSlot(pageSeq, name, saveToHistory, obj);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            pageUtil.triggerDrawPageThumbnail(page, photos);
            view.edit.setPageActive(pageSeq);
        }

        opEvent.eImageSlotChanged.register(function(e) {
            onImageSlotChanged(e);
        });

        opEvent.eTextSlotChanged.register(function(e) {
            onTextSlotChanged(e);
        });

        opEvent.eDecorationSlotChanged.register(function(e) {
            onDecorationSlotChanged(e);
        });

        opEvent.eShapeSlotChanged.register(function(e) {
            onShapeSlotChanged(e);
        });

        //图片框渲染完毕
        opEvent.eImageSlotRendered.register(function (e) {
            var pageSeq = e.pageSeq,
                name = e.name;

            var imgSlot = model.book.getImageSlotByPageSeqAndName(pageSeq, name);

            var requireSize = {
                width: model.definitionSizeConverter.mmToPx(imgSlot.width),
                height: model.definitionSizeConverter.mmToPx(imgSlot.height)
            };

            view.edit.setImgSlotRequireSize(pageSeq, name, requireSize);

            //TODO:根据照片判断精度是否满足
            //if (imgSlot.image && imgSlot.image.id) {
            //    judgeDefinition(imageSlot.image.id, pageSeq, imageSlotName, imageSlot.image.width);
            //}
        });

        opEvent.eImageSlotResize.register(function (e) {
            var pageSeq = e.pageSeq,
                name = e.name,
                widthMM = e.widthMM,
                heightMM = e.heightMM;

            var requireSize = {
                width: model.definitionSizeConverter.mmToPx(widthMM),
                height: model.definitionSizeConverter.mmToPx(heightMM)
            };

            view.edit.setImgSlotRequireSize(pageSeq, name, requireSize);
        });

        //图片框内插入新照片，注册
        opEvent.eInsertNewPhotoToSlot.register(function (e) {
            var il = e.il,
                pageSeq = e.pageSeq,
                name = e.name,
                isNet = e.isNet;

            //if (photoId === undefined) {
            //    throw new Error('photoId为undefined');
            //}
            if (pageSeq === undefined) {
                throw new Error('pageSeq为undefined');
            }
            if (name === undefined) {
                throw new Error('imageSlotName为undefined');
            }

            //var photo = model.Photo.findById(photoId);
            //photo.usedCount++;
            //var imageSlot = model.book.getImageSlotByPageSeqAndName(pageSeq, name);
            //if (imageSlot.image) {
            //    var oldPhoto = model.Photo.findById(imageSlot.image.id);
            //    if (oldPhoto) {
            //        oldPhoto.usedCount--;
            //        view.photoManager.setUsedCount(oldPhoto.id, oldPhoto.usedCount);
            //    }
            //}

            var photo = {
                id : il.ir.checksum,
                name : il.name,
                src : il.ir.src,
                width : il.ir.width,
                height : il.ir.height
            };

            view.edit.insertPhotoIntoImgSlot(photo, pageSeq, name, true, isNet, function () {
                //if (!confirmDefinition) {
                //    if (imageSlot.image && computeDefinition(photo.originalSize.width, imageSlot.image.width) < 0.9) {
                //        view.edit.showConfirmDefinition(pageSeq, imageSlotName);
                //    } else {
                //        view.confirmDefinition.close();
                //    }
                //}
            });
            view.edit.selectSlot(pageSeq, name);
            //view.photoManager.setUsedCount(photo.id, photo.usedCount);
            //view.photoManager.showImagePage();
        });

        opEvent.eImageSlotDelete.register(function (e) {
            var pageSeq = e.pageSeq, name = e.name;

            if (['back-flap'].contains(pageSeq)) {
                return;
            }

            //var imgslot = model.book.getImageSlotByPageSeqAndName(pageSeq, name);
            //if (imgslot.image && imgslot.image.id) {
            //    var photo = model.Photo.findById(imageSlot.image.id);
            //    photo.usedCount--;
            //    view.photoManager.setUsedCount(photo.id, photo.usedCount);
            //}

            model.book.deleteImageSlot(pageSeq, name);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);

            pageUtil.triggerDrawPageThumbnail(page, photos);

            initUndoRedoBtn();
        });

        opEvent.eTextSlotDelete.register(function (e) {
            var pageSeq = e.pageSeq, name = e.name;

            if (['back-flap'].contains(pageSeq)) {
                return;
            }

            model.book.deleteTextSlot(pageSeq, name);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page, photos);

            initUndoRedoBtn();
        });

        opEvent.eDecorationSlotDelete.register(function (e) {
            var pageSeq = e.pageSeq, name = e.name;

            if (['back-flap'].contains(pageSeq)) {
                return;
            }


            model.book.deleteDecorationSlot(pageSeq, name);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page, photos);

            initUndoRedoBtn();
        });

        opEvent.eNewShadingInsert.register(function (e) {
            var pageSeq = e.pageSeq;
            var shadingId = e.shadingId;
            var thumbUrl = e.shadingThumb;
            var editUrl = e.shadingEdit;
            var imgWidth = e.imgWidth;

            var bg = e.bg;

            var bgRatio = parseFloat(bg.width) / parseFloat(bg.height);

            var page = model.book.getPageBySeq(pageSeq);
            if (imgWidth > page.width)
                imgWidth = page.width;

            var imgHeight = imgWidth / bgRatio;
            if (imgHeight < page.height) {
                imgWidth = page.height / bg.height * bg.width;
            }

            model.book.addShadingSlot(pageSeq, shadingId, thumbUrl, editUrl, imgWidth);

            opEvent.eRefreshPage.trigger(exports, { seq: pageSeq });
        });

        opEvent.eRefreshPage.register(function (e) {
            var seq = e.seq;

            var page = model.book.getPageBySeq(seq);
            var photos = model.photo.getPhotoInPage(page);
            view.edit.initPageSlot(page, photos);

            pageUtil.triggerDrawPageThumbnail(page, photos);

            checkPageHistory();
        });

        opEvent.eShapeSlotDelete.register(function (e) {
            var pageSeq = e.pageSeq, name = e.name;

            if (['back-flap'].contains(pageSeq)) {
                return;
            }

            model.book.deleteShapeSlot(pageSeq, name);

            var page = model.book.getPageBySeq(pageSeq);
            var photos = model.photo.getPhotoInPage(page);

            view.edit.initPageSlot(page, photos);
            pageUtil.triggerDrawPageThumbnail(page, photos);

            initUndoRedoBtn();
        });

        //槽位按钮点击事件
        opEvent.eSlotBtnOpEvent.register(function(e) {
            var opEl = e.el;
            var opType = e.type;

            switch (opType) {
                case "zoomin" :
                case "zoomout" :
                case "adjust" :
                case "fill" :
                    onZoom(e);
                    break;
                case "rotate" :
                    onImageSlotRotate(e);
                    break;
                case "magic" :
                    break;
                case "borderwidth" :
                    onChangeSlotBorderWidth(e);
                    break;
                case "bordercolor" :
                    onChangeSlotBorderColor(e);
                    break;
                case "color":
                    onChangeShapeColor(e);
                    break;
                case "lock" :
                    onChangeSlotLock(e, true);
                    break;
                case "unlock" :
                    onChangeSlotLock(e, false);
                    break;
                case "locked" :
                    onChangeSlotLock(e);
                    break;
                case "z_index" :
                    onChangeSlotZindex(e);
                    break;
                case "copy" :
                    break;
                case "delete-slot" :
                    onSlotDelete(e);
                    break;
                case "delete-img" :
                    view.edit.removeImgSlotImg(opEl);
                    break;

                //文本
                case "style":
                    onTextChangeStyle(e);
                    break;
                case "weight":
                    onTextChangeWeight(e);
                    break;
                case "decoration":
                    onTextChangeDecoration(e);
                    break;
                case "align" :
                    onTextSlotAlign(e);
                    break;
                case "font-family":
                    onTextChangeFontFamily(e);
                    break;
                case 'font-color':
                    onTextSlotChangeColor(e);
                    break;
                case "font-size":
                    onTextSlotChangeFontSize(e);
                    break;
                case "letter-space":
                    onTextChangeLetterSpace(e);
                    break;
                case "line-height":
                    onTextChangeLineHeight(e);
                    break;

                default:
                    onChangeSlotAttr(e);
                    break;
            }
        });

        function onZoom(e) {
            var opEl = $(e.el);
            var opType = e.type;
            var pageSeq = opEl.parent().attr('data-seq');
            var slotName = opEl.attr('data-name');

            if (slot.isImageSlot(opEl)) {
                slot.image.zoomImgInSlot(opEl, opType);
            } else if (slot.isShadingSlot(opEl)) {

                var properties = slot.getAttr(opEl);
                var imgWidth;

                switch (opType) {
                    case 'zoomin':
                        imgWidth = properties.imgWidth + properties.imgWidth / 100;
                        break;
                    case 'zoomout':
                        imgWidth = properties.imgWidth - properties.imgWidth / 100;
                        break;
                    case 'fill' :
                        var page = model.book.getPageBySeq(pageSeq);
                        var bg = backgroundPool.getById(properties.shadingId);
                        var bgRatio = parseFloat(bg.width) / parseFloat(bg.height);

                        imgWidth = sizeConverter.pxToMm(properties.imgWidth);
                        if (imgWidth > page.width)
                            imgWidth = page.width;

                        var imgHeight = imgWidth / bgRatio;
                        if (imgHeight < page.height) {
                            imgWidth = page.height / bg.height * bg.width;
                        }

                        imgWidth = sizeConverter.mmToPx(imgWidth);
                        break;

                }
                if (imgWidth < 100)
                    imgWidth = 100;

                var obj =  { imgWidth: imgWidth };

                slot.setAttr(opEl,  obj);
                opEvent.eSlotChanged.trigger(exports, {
                    el : opEl,
                    pageSeq: pageSeq,
                    name: slotName,
                    obj: {
                        imgWidth : sizeConverter.pxToMm(imgWidth)
                    }
                })
            }
        }

        function onChangeSlotAttr(e) {
            var el = $(e.el);
            var value = e.value;
            var type = e.type;
            var isMM = e.isMM;

            var obj = {};
            if (isMM && (type == 'width' || type == 'height' || type == "x" || type == "y")) {
                obj[type] = sizeConverter.mmToPx(value);
            } else {
                obj[type] = value;
            }
            slot.setAttr(el, obj);

            obj[type] = value;
            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: obj
            });
        }

        function onTextChangeStyle(e) {
            var el = $(e.el);
            var value = e.value;
            var sender = e.sender;

            var attr = slot.getAttr(el);
            var newStyle =  attr.style === value ? "normal" : value;

            slot.setAttr(el, {
                style : newStyle
            });

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    style: newStyle
                }
            });
            if (sender != undefined) {
                if (newStyle == "normal")
                    sender.removeAttr('data-select');
                else
                    sender.attr('data-select', true);
            }
        }

        function onTextChangeWeight(e) {
            var el = $(e.el);
            var value = e.value;
            var sender = e.sender;

            var attr = slot.getAttr(el);
            var newWeight =  attr.weight === value ? "normal" : value;

            slot.setAttr(el, {
                weight : newWeight
            });

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    weight: newWeight
                }
            });
            if (sender != undefined) {
                if (newWeight == "normal")
                    sender.removeAttr('data-select');
                else
                    sender.attr('data-select', true);
            }
        }

        function onTextChangeDecoration(e) {
            var el = $(e.el);
            var value = e.value;
            var sender = e.sender;

            var attr = slot.getAttr(el);
            var newDecoration =  attr.decoration === value ? "none" : value;

            slot.setAttr(el, {
                decoration : newDecoration
            });

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    decoration : newDecoration
                }
            });
            if (sender != undefined) {
                if (newDecoration == "none")
                    sender.removeAttr('data-select');
                else
                    sender.attr('data-select', true);
            }
        }

        function onTextSlotAlign(e) {

            var el = $(e.el);
            var value = e.value;
            var sender = e.sender;

            var pageSeq = el.parent().attr('data-seq');
            var name = el.attr('data-name');

            if (el.parent().attr('data-seq') == 'front-flap') {
                slot.setAttr(el, {
                    align: value,
                    doNotAutoSetTextboxHeight: true
                });
            } else {
                slot.setAttr(el, {
                    align: value
                });
            }

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: pageSeq,
                name: name,
                obj: {
                    align: value
                }
            });
            if (sender != undefined)
                sender.attr('data-select', true).siblings('.edit-text-align').removeAttr('data-select');
        }

        function onTextChangeFontFamily(e) {
            var el = $(e.el);
            var value = e.value;

            var pageSeq = el.parent().attr('data-seq');
            var name = el.attr('data-name');

            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');
                sender.attr({
                    'data-value': value
                });
                var $span = sender.find('span');
                $span.css({
                    'font-family': 'font' + value + ',serif'
                }).text(fontPool.getFontName(value));
            }

            if (el.parent().attr('data-seq') == 'front-flap') {
                slot.setAttr(el, {
                    fontId: value,
                    doNotAutoSetTextboxHeight: true
                })
            } else {
                slot.setAttr(el, {
                    fontId: value
                });
            }

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: pageSeq,
                name: name,
                obj: {
                    fontId: value
                }
            });
        }

        function onTextSlotChangeColor(e) {
            var el = $(e.el);
            var value = e.value;

            var pageSeq = el.parent().attr('data-seq');
            var name = el.attr('data-name');

            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');
                sender.attr({
                    'data-value': value
                }).children('span').css({
                    'background-color': value
                });
            }

            if (el.parent().attr('data-seq') == 'front-flap') {
                slot.setAttr(el, {
                    color: value,
                    doNotAutoSetTextboxHeight: true
                })
            } else {
                slot.setAttr(el, {
                    color: value
                });
            }

            opEvent.eTextSlotChanged.trigger(exports, {
                pageSeq: pageSeq,
                name: name,
                obj: {
                    color: value
                }
            });
        }

        function onTextSlotChangeFontSize(e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');
                sender.attr({
                    'data-value': value,
                    'data-text': value + '点'
                }).children('span').text(value + 'pt');
            }

            if (el.parent().attr('data-seq') == 'front-flap') {
                slot.setAttr(el, {
                    pt: value,
                    doNotAutoSetTextboxHeight: true
                });

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        pt: value
                    }
                });
            } else {
                slot.setAttr(el, {
                    pt: value
                });

                var textboxHeight = sizeConverter.pxToMm(slot.text.getTextSlotTextHeight(el));

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        pt: value,
                        height: textboxHeight
                    }
                });
            }

            el.data('selectionHandles').resetPosition();

        }

        function onTextChangeLetterSpace(e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;

            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');
                sender.attr({
                    'data-value': value
                });
            }

            if (el.parent().attr('data-num') == 'front-flap') {
                slot.setAttr(el, {
                    space: value,
                    doNotAutoSetTextboxHeight: true
                });
                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        space: value
                    }
                });
            } else {
                slot.setAttr(el, {
                    space: value
                });

                var textboxHeight = sizeConverter.pxToMm(slot.text.getTextSlotTextHeight(el));

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        space: value,
                        height: textboxHeight
                    }
                });
            }

            el.data('selectionHandles').resetPosition();


        }

        function onTextChangeLineHeight(e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;

            if (subBtnId != undefined) {
                var sender = $('#' + subBtnId).data('sender');
                sender.attr({
                    'data-value': value
                });
            }

            if (el.parent().attr('data-num') == 'front-flap') {
                slot.setAttr(el, {
                    space: value,
                    doNotAutoSetTextboxHeight: true
                });
                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        leading: value
                    }
                });
            } else {
                slot.setAttr(el, {
                    leading: value
                });

                var textboxHeight = sizeConverter.pxToMm(slot.text.getTextSlotTextHeight(el));

                opEvent.eTextSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: {
                        leading: value,
                        height: textboxHeight
                    }
                });
            }

            el.data('selectionHandles').resetPosition();
        }

        opEvent.eSlotDelete.register(function(e) {
            onSlotDelete(e);
        });

        function onSlotDelete(e) {
            var el = $(e.el);
            var name = el.attr('data-name');
            var pageSeq = el.parent().attr('data-seq');

            if (slot.isLocked(el)) {
                SureMsg.error("请先解锁槽位");
            } else {
                if (slot.isImageSlot(el)) {
                    opEvent.eImageSlotDelete.trigger(exports, {
                        pageSeq : pageSeq,
                        name : name
                    })
                } else if (slot.isTextSlot(el)) {
                    opEvent.eTextSlotDelete.trigger(exports, {
                        pageSeq : pageSeq,
                        name : name
                    })
                } else if (slot.isDecorationSlot(el)) {
                    opEvent.eDecorationSlotDelete.trigger(exports, {
                        pageSeq : pageSeq,
                        name : name
                    })
                } else if (slot.isShapeSlot(el)) {
                    opEvent.eShapeSlotDelete.trigger(exports, {
                        pageSeq : pageSeq,
                        name : name
                    })
                }  else if (slot.isShadingSlot(el)) {
                    opEvent.eSlotsRemove.trigger(exports, {
                        slots: [{
                            pageSeq: pageSeq,
                            name: name,
                            type: slot.getShadingSlotName()
                        }]
                    });
                }
            }
        }

        function onImageSlotRotate(e) {
            var el = $(e.el);
            var value = e.value;

            var img = el.children('.content').children('.img');
            var properties = slot.getAttr(el);

            var obj;
            switch (value) {
                case '-90':
                    obj = {
                        image: {
                            rotation: ((properties.image.rotation - 90) % 360)
                        }
                    };
                    break;
                case '90':
                    obj = {
                        image: {
                            rotation: ((properties.image.rotation + 90) % 360)
                        }
                    };
                    break;
            }

            slot.setAttr(el, obj);
            slot.image.preventImgOutSlot(el);

            if (el.data('backImgWrapper'))
                el.data('backImgWrapper').css('transform', transform.getCurrentTransform(img));

            if (el.data('rotateChangeEventClockToken')) {
                clearTimeout(el.data('rotateChangeEventClockToken'));
                el.removeData('rotateChangeEventClockToken');
            }
            el.data('rotateChangeEventClockToken', setTimeout(function () {
                opEvent.eImageSlotChanged.trigger(exports, {
                    pageSeq: el.parent().attr('data-seq'),
                    name: el.attr('data-name'),
                    obj: obj
                });
            }, 400));
        }

        function onChangeSlotBorderWidth(e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var parentBtn = $('#' + subBtnId).data('sender');
                parentBtn.attr({
                    'data-value': value
                });
            }

            slot.setAttr(el, {
                borderWidth: sizeConverter.ptToPx(value)
            });

            var xy = view.edit.computeSlotXY(el);
            slot.setAttr(el, {
                x: xy.x,
                y: xy.y
            });

            el.data('selectionHandles').resetPosition();

            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    borderWidth: value,
                    x: sizeConverter.pxToMm(xy.x),
                    y: sizeConverter.pxToMm(xy.y)
                }
            });

            $(document).triggerHandler('pointerdown.hideSubBtn#' + subBtnId);
        }

        function onChangeSlotBorderColor( e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var parentBtn = $('#' + subBtnId).data('sender');
                parentBtn.attr({
                    'data-value': value
                }).find('.ybicon-border-color, .color').css({
                    'color': value,
                    'background-color' : value
                });
            }

            slot.setAttr(el, {
                borderColor: value
            });

            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    borderColor: value
                }
            });

        }

        function onChangeShapeColor(e) {
            var el = $(e.el);
            var value = e.value;
            var subBtnId = e.btnId;
            if (subBtnId != undefined) {
                var parentBtn = $('#' + subBtnId).data('sender');
                parentBtn.attr({
                    'data-value': value
                }).children('span').css({
                    'background-color': value
                });
            }

            slot.setAttr(el, {
                color: value
            });

            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: el.parent().attr('data-seq'),
                name: el.attr('data-name'),
                obj: {
                    color: value
                }
            });

        }

        function onChangeSlotLock(e, isLock) {
            var el = $(e.el);
            var pageSeq = el.parent().attr('data-seq');
            var name = el.attr('data-name');
            var sender = e.sender;
            var value = e.value;

            if (isLock == undefined) {
                isLock = value;
            }

            slot.setAttr(el, {
                locked: isLock
            });

            view.edit.selectSlot(pageSeq, name);

            opEvent.eSlotChanged.trigger(exports, {
                el : el,
                pageSeq: pageSeq,
                name: name,
                obj: {
                    locked: isLock
                },
                saveToHistory: false
            });

            if (sender != undefined) {
                sender.attr('data-locked', isLock);
                if (isLock != "false") {
                    sender.attr('data-value', true);
                } else {
                    sender.attr('data-value', false);
                }
            }

        }

        function onChangeSlotZindex(e) {
            var el = $(e.el);
            var value = e.value;

            view.edit.setSlotZIndex(el, value);
        }

        opEvent.eSlotsRemove.register(function (e) {
            var slots = e.slots;

            var pageSeqs = [];

            slots.forEach(function (item) {
                var pageSeq = item.pageSeq;
                var name = item.name;
                var type = item.type;

                if (type === 'imageslot') {
                    var imgSlot = model.book.getImageSlotByPageSeqAndName(pageSeq, name);
                    if (imgSlot.image && imgSlot.image.id) {
                        var photo = model.photo.getById(imgSlot.image.id);
                        //photo.usedCount--;
                        //view.photoManager.setUsedCount(photo.id, photo.usedCount);
                    }
                }

                if (!pageSeqs.some(function (seq) {
                        return seq === pageSeq;
                    })) {
                    pageSeqs.push(pageSeq);
                }
            });

            model.book.removeSlots(slots);

            pageSeqs.forEach(function (seq) {
                var page = model.book.getPageBySeq(seq);
                var photos = model.photo.getPhotos(page);

                view.edit.initPageSlot(page, photos);
                pageUtil.triggerDrawPageThumbnail(page, photos);
            });
        });


    }

    function initUndoRedoBtn() {
        view.toptool.enable('btn-undo');
        view.toptool.disable('btn-redo');
    }

    function checkPageHistory(pageSeq) {
        var undoHistoryLength = model.book.getUndoHistoryLength(pageSeq);
        if (undoHistoryLength > 0) {
            view.toptool.enable('btn-redo');
        } else {
            view.toptool.disable('btn-redo');
        }
        var historyLength = model.book.getHistoryLength(pageSeq);
        if (historyLength > 0) {
            view.toptool.enable('btn-undo');
        } else {
            view.toptool.disable('btn-undo');
        }
    }

    //版式被选中后变更页的数据
    function changePageData(args) {
        var page = args.page,
            template = args.template;

        var newPage = model.book.generateNewPage(page.seq, "change", page.type, template, true);

        var i;

        for (i = 0; i < page.imageSlotList.length; i++) {
            var currentImgbox = page.imageSlotList[i],
                currentPhoto;

            //如果是固定照片的主题就不记录选中的照片
            if (!currentImgbox.image || currentImgbox.themeImage) {
                continue;
            }

            currentPhoto = model.photo.getById(currentImgbox.image.id);
            if (!currentPhoto) {
                continue;
            }

            //从原来的页上找出精度最接近的图片框
            var closestDefinition = 0,
                closestNewImgSlot = null;
            for (var j = 0; j < newPage.imageSlotList.length; j++) {
                var currentNewImgbox = newPage.imageSlotList[j];

                if (currentNewImgbox.image) {
                    continue;
                }

                var currentDefinition;
                if (currentPhoto.ir.width / currentPhoto.ir.height >= currentNewImgbox.width / currentNewImgbox.height) {
                    currentDefinition = computeDefinition(currentPhoto.ir.width, currentNewImgbox.width);
                } else {
                    currentDefinition = computeDefinition(currentPhoto.ir.width, currentNewImgbox.height * currentPhoto.ir.width / currentPhoto.ir.height);
                }

                if (currentDefinition > closestDefinition) {
                    closestDefinition = currentDefinition;
                    closestNewImgSlot = currentNewImgbox;
                }
            }

            if (closestNewImgSlot) {
                var photo = model.photo.getById(currentImgbox.image.id);

                var imageWidth, imageHeight;
                if (photo.ir.width / photo.ir.height >= closestNewImgSlot.width / closestNewImgSlot.height) {
                    imageWidth = closestNewImgSlot.height * photo.ir.width / photo.ir.height;
                    imageHeight = closestNewImgSlot.height;
                } else {
                    imageWidth = closestNewImgSlot.width;
                    imageHeight = closestNewImgSlot.width * photo.ir.height / photo.ir.width;
                }

                var imageX = (closestNewImgSlot.width - imageWidth) / 2,
                    imageY = (closestNewImgSlot.height - imageHeight) / 2;

                closestNewImgSlot.image = {
                    x: imageX,
                    y: imageY,
                    id: currentImgbox.image.id,
                    width: imageWidth,
                    rotation: 0,
                    fileName: photo.fileName
                };
            }
        }

        for (i = 0; i < newPage.textSlotList.length; i++) {
            var textbox = page.textSlotList[i],
                newTextbox = newPage.textSlotList[i];

            var editorStatus = 0;
            if (textbox) {
                newTextbox.content = editorStatus == 0 ? textbox.content : newTextbox.content;
                //换模版保持原来字体
                newTextbox.fontId = editorStatus == 0 ? textbox.fontId : newTextbox.fontId;
            } else {
                newTextbox.content = editorStatus == 0 ? '' : newTextbox.content;
            }
        }
        if (page.decorationSlotList !== undefined && page.decorationSlotList !== null) {
            if (newPage.decorationSlotList == undefined || newPage.decorationSlotList == null) {
                newPage.decorationSlotList = [];
            }
            for (var g = 0; g < page.decorationSlotList.length; g++) {

                newPage.decorationSlotList[g] = page.decorationSlotList[g];
            }
        }

        if (page.shapeSlotList !== undefined && page.shapeSlotList !== null) {
            if (newPage.shapeSlotList == undefined || newPage.shapeSlotList == null) {
                newPage.shapeSlotList = [];
            }
            for (var f = 0; f < page.shapeSlotList.length; f++) {

                newPage.shapeSlotList[f] = page.shapeSlotList[f];
            }
        }

        if (model.book.replacePage(newPage) === true) {
            var pages = [];
            switch (newPage.type) {
                case 'normal':
                    if (newPage.seq % 2 !== 0) {
                        pages = [model.book.getPageBySeq(newPage.seq - 1), newPage];
                    } else {
                        pages = [newPage, model.book.getPageBySeq(parseFloat(newPage.seq) + 1)];
                    }
                    break;
                default:
                    pages = [newPage];
                    break;
            }
            var photos = model.photo.getPhotoInPage(pages);

            view.edit.render(pages, photos, false, newPage.seq);
            pageUtil.triggerDrawPageThumbnail(newPage, photos);
        } else {
            throw new Error('更换模板失败');
        }
    }

    function computeImgWidthMMByDefinition(imgOriginalWidthPx, definition) {
        //算出图原样印刷出来的毫米宽度
        var imgOriginalWidthMM = model.definitionSizeConverter.pxToMm(imgOriginalWidthPx);
        return imgOriginalWidthMM / definition;
    }

    function computeDefinition(imgOriginalWidthPx, imgWidthMM) {
        //算出图原样印刷出来的毫米宽度
        var imgOriginalWidthMM = model.definitionSizeConverter.pxToMm(imgOriginalWidthPx);
        //清晰度 = 原始宽度 / 印刷宽度
        return imgOriginalWidthMM / imgWidthMM;
    }

    exports.init = init;
});

define('fontPool',['pool'], function (require, exports, module) {
    var Pool = require('pool');

    var type = "font";
    var fontPool;

    function init() {
        fontPool = new Pool(type);
    }

    function getFontById(id) {
        var fonts = fontPool.getAdmin();
        for (var i = 0; i < fonts.length; i ++) {
            var de = fonts[i];
            if (de.value == id) {
                return de;
            }
        }
        return null;
    }

    function getFontByName(name) {
        var fonts = fontPool.getAdmin();
        for (var i = 0; i < fonts.length; i ++) {
            var de = fonts[i];
            if (de.name == name) {
                return de;
            }
        }
        return null;
    }

    function getFontName(fontId) {
        var font = getFontById(fontId);
        if (font != null) {
            return font.name;
        }
    }

    function getFonts() {
        return fontPool.getAdmin();
    }

    exports.init = init;
    exports.getFontById = getFontById;
    exports.getFontByName = getFontByName;
    exports.getFontName = getFontName;
    exports.getFonts = getFonts;

});
define('templatePool', function (require, exports, module) {
    var allPageTemplate = [];
    function init(bookInfo) {
        Api.template.getAllPageTemplate(bookInfo.width, bookInfo.height, function(allPageTpl) {
            allPageTemplate = allPageTpl.data;
        });
    }

    function getAll(imgNum, type) {
        var retTpl = [];

        if (imgNum == undefined || imgNum == "all") {
            retTpl = allPageTemplate;
        } else if (imgNum == "n") {

            $.each(allPageTemplate, function(i, tpl) {
                if (tpl.resource.imageSlotList.length > 4) {
                    retTpl.push(tpl);
                }
            });
        } else {
            imgNum = parseInt(imgNum);

            $.each(allPageTemplate, function(i, tpl) {
                if (tpl.resource.imageSlotList.length == imgNum) {
                    retTpl.push(tpl);
                }
            });
        }

        if (type == undefined) {
            return retTpl;
        } else {
            var typeTpl =  [];
            $.each(retTpl, function(i, tpl) {
                if (tpl.type == type) {
                    typeTpl.push(tpl);
                }
            });
            return typeTpl;
        }
    }

    function add(pageTemplate) {
        allPageTemplate.unshift(pageTemplate);
    }

    function get(id) {
        for (var i = 0; i < allPageTemplate.length; i ++) {
            var pt = allPageTemplate[i];
            if (pt.id == id) {
                return pt;
            }
        }
    }

    function del(id) {
        for (var i = 0; i < allPageTemplate.length; i ++) {
            var pt = allPageTemplate[i];
            if (pt.id == id) {
                allPageTemplate.splice(i, 1);
            }
        }
    }

    exports.init = init;
    exports.getAll = getAll;
    exports.add = add;
    exports.del = del;
    exports.get = get;
});
define('backgroundPool',['pool'], function (require, exports, module) {

    var Pool = require('pool');

    var type = "background";
    var bgPool;

    function init() {
        bgPool = new Pool(type);
    }

    function getUser() {
        return bgPool.getUser();
    }

    function getAdmin() {
        return bgPool.getAdmin();
    }

    function addOne(bg) {
        bgPool.add(bg)
    }

    function deleteOne(id) {
        bgPool.del(id);
    }

    function getById(id) {
        return bgPool.getById(id);
    }

    function getUserById(id) {
        return bgPool.getUserById(id);
    }

    function getByStyle(style) {
        return bgPool.getByStyle(style);
    }

    function getByTag(tag) {
        return bgPool.getByTag(tag);
    }

    function getUserByCode(md5) {
        return bgPool.getUserByCode(md5);
    }

    function isExist(file, bookId, existCb, noExistCb) {
        bgPool.isExist(file, bookId, existCb, noExistCb);
    }

    exports.init = init;
    exports.getUser = getUser;
    exports.getAdmin = getAdmin;
    exports.addOne = addOne;
    exports.deleteOne = deleteOne;
    exports.getById = getById;
    exports.getUserById = getUserById;
    exports.getByStyle = getByStyle;
    exports.getByTag = getByTag;
    exports.getUserByCode = getUserByCode;
    exports.isExist = isExist;
});
define('decorationPool',['pool'], function (require, exports, module) {
    var Pool = require('pool');

    var type = "decoration";
    var dePool;

    function init() {
        dePool = new Pool(type);
    }

    function getUser() {
        return dePool.getUser();
    }

    function getAdmin() {
        return dePool.getAdmin();
    }

    function addOne(decoration) {
        dePool.add(decoration)
    }

    function deleteOne(id) {
        dePool.del(id);
    }

    function getById(id) {
        return dePool.getById(id);
    }

    function getUserById(id) {
        return dePool.getUserById(id);
    }

    function getByStyle(style) {
        return dePool.getByStyle(style);
    }

    function getByTag(tag) {
        return dePool.getByTag(tag);
    }

    function getUserByCode(md5) {
        return dePool.getUserByCode(md5);
    }

    function isExist(file, bookId, existCb, noExistCb) {
        dePool.isExist(file, bookId, existCb, noExistCb);
    }

    exports.init = init;
    exports.getUser = getUser;
    exports.getAdmin = getAdmin;

    exports.addOne = addOne;
    exports.deleteOne = deleteOne;
    exports.getById = getById;
    exports.getUserById = getUserById;
    exports.getByStyle = getByStyle;
    exports.getByTag = getByTag;
    exports.getUserByCode = getUserByCode;
    exports.isExist = isExist;
});
define('ImageRes',['md5'], function (require, exports, module) {
    var baseUrl = "/api/imageRes/";

    var md5 = require('md5');

    var ir = {
        addIR: function (ir, callback) {
            SureAjax.ajax({
                url: baseUrl,
                type: "POST",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(ir),
                success: callback
            });
        },

        getIRByChecksum: function (checksum, found, notFound) {
            var ir = null;
            var async = typeof(found) == "function";
            SureAjax.ajax({
                async: async,
                parseError: false,
                url: baseUrl + "checksum/" + checksum,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")notFound();
                }
            });
            return ir;
        },

        getImageExif: function (irId, found) {
            var ir = null;
            SureAjax.ajax({
                url: baseUrl + irId + "/exif",
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")notFound();
                }
            });
            return ir;
        },

        toDate: function (str) {
            // 2015-12-10 17:18:02 -->  2015/12/10 17:18:02
            var strs = str.replace(':', '/').replace(':', '/');
            return new Date(strs);
        },

        /**
         * 通过七牛文件构建ImageRes对象
         * @param up
         * @param file
         * @param res
         * @param exif
         */
        createIRFromQiniu: function (up, file, res, exif) {
            var ir = {};
            exif = exif || {};
            var domain = up.getOption('domain');
            Qiniu.domain = domain;
            var imageInfo = Qiniu.imageInfo(res.key);
            if (domain.charAt(domain.length - 1) == "/") {
                domain = domain.substring(0, domain.length - 1);
            }
            var url = domain + "/" + encodeURI(res.key);
            ir.name = file.name;
            ir.src = url;
            ir.uploadTime = new Date();
            ir.checksum = file.md5;
            var photoTime = exif.DateTime || exif.DateTimeOriginal;
            ir.photoTime = photoTime ? ir.toDate(photoTime) : null;
            ir.format = imageInfo.format;
            ir.width = imageInfo.width;
            ir.height = imageInfo.height;
            ir.colorModel = imageInfo.colorModel;
            ir.linkNum = 0;
            if (exif.Model)
                ir.model = exif.Model;
            else if (exif.Software)
                ir.model = exif.Software;
            ir.exif = {
                checksum: ir.checksum,
                jsonExif: JSON.stringify(exif)
            };
            return ir;
        },

        isIRExist: function (file, existCb, noExistCb) {
            md5.calMd5(file, function (md5) {
                ir.getIRByChecksum(md5, function (ret) {
                    if (ret) {
                        if (typeof(existCb) === "function")existCb(ret);
                    }
                }, function () {
                    if (typeof(noExistCb) === "function")noExistCb(md5);
                });
            });
        }
    };

    return ir;
});
define('template', function (require, exports, module) {
    //var  SureAjax = require("common/api/ajax");
    //var  SureUtil = require("common/base/util");

    var level = {
        user : "U",
        admin : "A"
    };

    function addPageTemplate(pageTemplate, callback) {
        pageTemplate.createUserId =  SureUtil.getLoginId();
        pageTemplate.createUserName = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/pt/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(pageTemplate),
            success: callback
        });
    }

    function getOnePageTemplate(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function updatePageTemplate(ptId, newPt, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newPt),
            success: callback
        });
    }

    function delPageTemplate(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function getAllPageTemplate(width, height, callback) {
        SureAjax.ajax({
            url: "/api/pt/?width=" + width + "&height=" + height,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function savePtr(ptId, ptr, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId + "/resource",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(ptr),
            success: callback
        });
    }

    function getPtr(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId + "/resource",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function addBookTemplate(bookTemplate, callback, copyId) {
        if (copyId != undefined) {
            SureAjax.ajax({
                url: "/api/bt/?copy=" + copyId,
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(bookTemplate),
                success: callback
            });
        } else {
            SureAjax.ajax({
                url: "/api/bt/",
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(bookTemplate),
                success: callback
            });
        }
    }

    function getAllBookTemplate(callback) {
        SureAjax.ajax({
            url: "/api/bt/",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function delBookTemplate(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function updateBookTemplate(btId, newBt, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newBt),
            success: callback
        });
    }

    function getOneBookTemplate(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function saveBtr(btId, btr, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId + "/resource",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(btr),
            success: callback
        });
    }

    function getBtr(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId + "/resource",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function getUserBookTemplate(callback) {
        var userId = SureUtil.getLoginId();
        SureAjax.ajax({
            url: "/api/user/" + userId + "/bt/",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    exports.addPageTemplate = addPageTemplate;
    exports.updatePageTemplate = updatePageTemplate;
    exports.getPageTemplate = getOnePageTemplate;
    exports.getAllPageTemplate = getAllPageTemplate;
    exports.delPageTemplate = delPageTemplate;
    exports.savePtr = savePtr;
    exports.getPtr = getPtr;

    exports.addBookTemplate = addBookTemplate;
    exports.getBookTemplate = getOneBookTemplate;
    exports.updateBookTemplate = updateBookTemplate;
    exports.delBookTemplate = delBookTemplate;
    exports.getAllBookTemplate = getAllBookTemplate;

    exports.getUserBookTemplate = getUserBookTemplate;

    exports.saveBtr = saveBtr;
    exports.getBtr = getBtr;

});



define('material', function (require, exports, module) {
    //var  SureAjax = require("common/api/ajax");
    //var  SureUtil = require("common/base/util");

    var level = {
        user : "U",
        admin : "A"
    };

    function addMaterial(material, callback) {
        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function addUserMaterial(material, callback) {

        material["level"] = level.user;

        material["createUserId"] = SureUtil.getLoginId();
        material["createUserName"] = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function addAdminMaterial(material, callback) {

        material["level"] = level.admin;

        material["createUserId"] = SureUtil.getLoginId();
        material["createUserName"] = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function updateOneMaterial(matId, newMaterial, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newMaterial),
            success: callback
        });
    }

    function delOneMaterial(matId, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: {},
            success: callback
        });
    }

    function getOneMaterial(matId, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            dataType: "json",
            success: callback
        });
    }


    function getUserMaterialByType(type, start, limit, callback) {

        var loginUserId = SureUtil.getLoginId();

        SureAjax.ajax({
            url: "/api/user/" + loginUserId + "/material",
            type: "GET",
            async : false,
            headers: {
                Accept: "application/json"
            },
            dataType: "json",
            data: {
                t: type,
                start: start,
                limit: limit
            },
            success: callback
        });
    }

    function getAdminMaterialByType(type, start, limit, callback) {

        SureAjax.ajax({
            url: "/api/admin/material",
            type: "GET",
            headers: {
                Accept: "application/json"
            },
            async : false,
            dataType: "json",
            data: {
                t: type,
                start: start,
                limit: limit
            },
            success: callback
        });
    }

    function createDecoration(ir) {
        var m = {};

        m.value = ir.src;
        m.type = 'decoration';
        m.code = ir.checksum;
        m.name = ir.name;
        m.width = ir.width;
        m.height = ir.height;
        m.url = ir.url;

        return m;
    }

    function createBackground(ir) {
        var m = {};

        m.value = ir.src;
        m.type = 'background';
        m.code = ir.checksum;
        m.name = ir.name;
        m.width = ir.width;
        m.height = ir.height;
        m.url = ir.src;

        return m;
    }


    exports.add = addMaterial;
    exports.addUser = addUserMaterial;
    exports.addAdmin = addAdminMaterial;
    exports.update = updateOneMaterial;
    exports.del = delOneMaterial;
    exports.get = getOneMaterial;
    exports.getByType = getUserMaterialByType;
    exports.getAdminByType = getAdminMaterialByType;

    exports.createDecoration = createDecoration;
    exports.createBackground = createBackground;

});



define('app',['material','template','ImageRes','decorationPool','backgroundPool','templatePool','fontPool','presenter','view','opEvent','index'], function (require, exports, module) {

    var Api = {
        getBookInfo : function(bookId, cb) {
            var url = "/api/book/info/" + bookId + "?type=tpl";
            if (!isTpl) {
                url = "/api/book/info/" + bookId + "?type=book";
            }

            SureAjax.ajax({
                url: url,
                type: "GET",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                success: function(bi) {
                    cb(bi);
                }
            });
        },

        updateBook : function(cb) {
            SureAjax.ajax({
                url: "/api/book/info/",
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(model.book.getBookInfo()),
                success: function() {
                    if (typeof cb == 'function') {
                        cb();
                    }
                }
            });
        },

        material : require('material'),
        template : require('template'),
        imageRes : require('ImageRes')
    };


    var App = {
        data : {},
        init : function() {

            var bookId =  App.getParameterByName("bid");
            if (typeof curBookId != 'undefined') {
                bookId = curBookId;
            }
            if (!_.isNumber(parseInt(bookId))) {
                SureMsg.alert("参数不正确");
                return;
            }

            App.data.bookId = bookId;

            Api.getBookInfo(bookId, function(bookInfo) {
                App.data.book = bookInfo;

                App.initView();
            });
        },

        initView : function() {
            //设置全局变量
            App.setGlobalVariable();
            //初始化视图东东
            View.init();
        },

        //获取url参数值
        getParameterByName: function (name) {
            var match = RegExp('[?&]' + name + '=([^&]*)')
                .exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        },
        //截取url参数
        getParameter: function (num) {
            var url = window.location.href;
            url = url.split("?")[0].split("#")[0];
            var parameter = url.split("/")[url.split("/").length - num].toLowerCase();
            return parameter;
        },

        setGlobalVariable : function() {

        }
    };

    var Pool = {
        init : function(bookInfo) {
            var decorationPool = require('decorationPool');
            var backgroundPool = require('backgroundPool');
            var templatePool = require('templatePool');
            var fontPool = require('fontPool');

            decorationPool.init(bookInfo);
            backgroundPool.init(bookInfo);
            templatePool.init(bookInfo);
            fontPool.init(bookInfo);

            window.decorationPool = decorationPool;
            window.backgroundPool = backgroundPool;
            window.templatePool = templatePool;
            window.fontPool = fontPool;

            window.Pool = {
                decoration : decorationPool,
                background : backgroundPool,
                template : templatePool,
                font : fontPool
            }
        }
    };


    var View = {
        init : function() {
            var presenter = require('presenter'),
                view = require('view');
            var opEvent = require('opEvent');
            var model = require('index');

            //初始化编辑器
            window.view = view;
            window.opEvent = opEvent;
            window.presenter = presenter;
            window.model = model;

            window.Api = Api;
            window.App = App;

            Pool.init(App.data.book);

            model.book.init(App.data.book);
            model.photo.getBookPhoto(App.data.book.id);

            view.init(App.data.book);
            presenter.init(App.data.book);
        }
    };

    App.init();

});


// 加载入口模块
seajs.use('app');
