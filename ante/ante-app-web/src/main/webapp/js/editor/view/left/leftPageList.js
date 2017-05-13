define("view/left/leftPageList", function(require, exports, module) {

    var pageUtil = require('editor/util/pageUtil');
    var Event = require("common/event/event");

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