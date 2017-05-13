define('common/align/more_selection', function (require, exports, module) {

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