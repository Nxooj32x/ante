define('editor/util/canvas', function(require, exports, module) {

    var SizeConverter = require('common/size-converter/size-converter');
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
