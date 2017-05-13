define('view/left/leftPhoto', function(require, exports, module) {

    var SizeConverter = require('common/size-converter/size-converter');
    var Event = require("common/event/event");
    var Draggable = require('common/draggable/draggable');
    var transform = require("common/transform/transform");
    var pageUtil = require('editor/util/pageUtil');

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