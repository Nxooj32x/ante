define("view/pagelist", function(require, exports, module) {

    var pageUtil = require('editor/util/pageUtil');
    var Event = require("common/event/event");

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