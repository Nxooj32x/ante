define('editor/slot/imageSlot', function (require, exports, module) {

    var SizeConverter = require("common/size-converter/size-converter");
    var transform = require("common/transform/transform");
    var imgload = require("common/imgload/imgload");
    var opEvent = require("editor/opEvent");

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