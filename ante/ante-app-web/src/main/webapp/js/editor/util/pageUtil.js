define('editor/util/pageUtil', function(require, exports, module) {

    var SizeConverter = require('common/size-converter/size-converter');
    var canvasUtil = require('editor/util/canvas');
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