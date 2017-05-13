define('editor/model/book', function (require, exports, module) {

    var canvas = require('editor/util/canvas');

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