define("view/pagesort", function(require, exports, module) {

    var Draggable = require('common/draggable/draggable');
    var transform = require("common/transform/transform");
    var Event = require("common/event/event");
    var pageUtil = require('editor/util/pageUtil');

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