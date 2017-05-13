define('editor/presenter', function (require, exports, module) {
    var slot = require('editor/slot/slot');
    var transform = require("common/transform/transform");
    var SizeConverter = require('common/size-converter/size-converter');
    var pageUtil = require('editor/util/pageUtil');
    var canvasUtil = require('editor/util/canvas');

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
