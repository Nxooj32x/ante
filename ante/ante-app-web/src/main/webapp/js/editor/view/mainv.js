define('view/mainv', function(require, exports, module) {

    var Event = require("common/event/event");

    var editMode = {
        edit : 'edit-book',
        sort : 'sort-page',
        preview : 'preview-book'
    };

    function init() {
        $('body').attr('data-type', editType);

        setEditMode(editMode.edit, editMode.edit);
        onEditescaleByWin();

        SureUtil.changeButtonCss();
    }

    function bind() {
        $('#switchSortpage').unbind('click').on('click', function() {
            //切换编辑模式
            var type = $(this).attr('data-type');
            $('.page_control_header .act_btn').removeClass('selected');
            $(this).addClass('selected');

            var from = $('body').attr('data-mode');

            opEvent.eModeChange.trigger(exports, {
                from : from,
                to : type
            });
        })
    }

    function initBookPreview() {

        $('body').attr({
            'data-bookscale-bottom': 'scalehide',
            'data-bookscale-left': 'scalehide',
            'data-bookscale-right': 'scalehide',
            'data-mode' : 'preview-book'
        });

        $('.preview-hide').hide();
    }

    /**
     * 设置整个页面的编辑模式
     *
     * 编辑模式包括：
     *      sort-page ： 页面排序
     *      edit-book ： 编辑书册
     *      preview-book ： 预览书册
     *
     * @param from  旧编辑模式
     * @param to    新编辑模式
     * @param args  参数
     */
    function setEditMode(from, to, args) {
        args = args || {};

        var onSuccess = args.onSuccess;

        $('body').attr('data-mode', to);

        if(editType == "create-tpl"){
            $('body').attr({
                'data-bookscale-bottom': 'scaleshow',
                'data-bookscale-left': 'scaleshow',
                'data-bookscale-right': 'scaleshow'
            });

            $('#pageEditMain .edit_box_tool').hide();
        } else if(editType == "user-edit"){
            $('body').attr({
                'data-bookscale-bottom': 'scaleshow',
                'data-bookscale-left': 'scaleshow'
            });
        } else if (editType == "user-preview") {
            initBookPreview();
        }


        switch (to) {
            case 'sort-page':
                view.pagesort.initPageSort();
                $('#switchSortpage').html('<span class="icon-th"></span>编辑模式').attr('data-type', "edit-book").attr('title', "编辑模式");
                $('#footerPageList .page_control_header .act_btn[data-type]').removeClass('selected');
                $('#changeEditModeToSortPage').addClass('selected');
                break;
            case 'edit-book':
                if (args && args.book) {

                    opEvent.eRefreshAll.trigger(exports, {
                        book: args.book,
                        photos : args.photos,
                        selectPageSeq : view.edit.getActivePageSeq()
                    });

                    //view.pagelist.refresh(args.book, args.photos, function () {
                    //    if (typeof onSuccess === 'function') {
                    //        onSuccess.call(exports);
                    //    }
                    //});
                }
                //else if (from === 'preview') {
                //    _pageListItemSelected.trigger(exports, {
                //        pageNums: $('#list_page .list_page-item[aria-selected="true"]').attr('data-page-nums').split(',')
                //    });
                //}
                $('#switchSortpage').html('<span class="icon-th"></span>列表模式').attr('data-type', "sort-page").attr('title', "列表模式");
                $('#footerPageList .page_control_header .act_btn[data-type]').removeClass('selected');
                $('#changeEditModeToEditBook').addClass('selected');
                break;
            case 'preview-book':
                if (from == 'preivew-book') {
                    $('body').attr({
                        'data-bookscale-bottom': 'scaleshow',
                        'data-bookscale-left': 'scaleshow',
                        'data-bookscale-right': 'scaleshow'
                    });
                } else {
                    $('body').attr({
                        'data-bookscale-bottom': 'scalehide',
                        'data-bookscale-left': 'scalehide',
                        'data-bookscale-right': 'scalehide'
                    });
                }

                break;
        }
        if (from == 'preview-book' || to == 'preview-book') {
            view.edit.resetBookScaleAndPosition();
        }
    }

    function initEvent() {
        opEvent.eModeChange.register(function(e) {
            var from = e.from,
                to = e.to,
                args = e.args || {};

            switch (from) {
                case 'sort-page':
                    if (args.save) {
                        view.pagesort.save();
                    }
                    break;
            }

            var book, photos;
            book = model.book.getBookInfo();
            photos = model.photo.getPhotos();

            switch (to) {
                case 'edit-book':
                    if (args.save) {
                        setEditMode(from, to, {
                            book: book,
                            photos: photos
                        });
                    } else {
                        setEditMode(from, to);
                    }
                    break;
                case 'sort-page':
                    setEditMode(from, to, {
                        book: book,
                        photos: photos
                    });
                    break;
                case 'preview-book':
                    setEditMode(from, to, {
                        book: book,
                        photos: photos
                    });
                    break;
            }
        });
    }

    function onEditescaleByWin() {
        var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        var bWidth = 1086, bHeight = 768;

        var cbody = $('body'),
            asideLeftLock = $('.aside_left_lock'),
            asideRightLock = $('.aside_right_lock'),
            footerLock = $('.footer_lock'),
            hideAside = $('#hideAside');

        showAndResign();
        //checkWindowSize();

        function hideLeft(){
            cbody.attr('data-bookscale-left', 'scalehide');
            asideLeftLock.attr('data-lock','true');
        }

        function hideRight(){
            cbody.attr('data-bookscale-right', 'scalehide');
            asideRightLock.attr('data-lock','true');
        }

        function showLeft(){
            cbody.attr('data-bookscale-left', 'scaleshow');
            asideLeftLock.attr('data-lock','false')
        }

        function showRight(){
            cbody.attr('data-bookscale-right', 'scaleshow');
            asideRightLock.attr('data-lock','false')
        }

        function hideFooter(){
            cbody.attr('data-bookscale-bottom', 'scalehide');
            footerLock.attr('data-lock','true');
        }

        function showFooter(){
            cbody.attr('data-bookscale-bottom', 'scaleshow');
            footerLock.attr('data-lock','false')
        }

        function showAndResign() {
            asideLeftLock.on('click', function (e) {
                e.preventDefault();
                var lock = asideLeftLock.attr('data-lock');
                if(lock == 'true'){
                    showLeft();
                }else if(lock == 'false'){
                    hideLeft();
                }
                view.edit.resetBookScaleAndPosition();
            });
            asideRightLock.on('click', function (e) {
                e.preventDefault();
                var lock = asideRightLock.attr('data-lock');
                if(lock == 'true'){
                    showRight();
                }else if(lock == 'false'){
                    hideRight();
                }
                view.edit.resetBookScaleAndPosition();
            });
            footerLock.on('click', function (e) {
                e.preventDefault();
                var lock = footerLock.attr('data-lock');
                if(lock == 'true'){
                    showFooter();
                }else if(lock == 'false'){
                    hideFooter();
                }
                view.edit.resetBookScaleAndPosition();
            });
            //显示/隐藏侧栏 底栏 待确定设计后再优化
            hideAside.on('click', function () {
                var select = $(this).attr('data-lock');
                if (select == "false") {
                    hideFooter();
                    hideLeft();
                    hideAside.attr('data-lock', true);
                } else {
                    showFooter();
                    showLeft();
                    hideAside.attr('data-lock', false);
                }
                view.edit.resetBookScaleAndPosition();
            });
        }

        function checkWindowSize(type) {
            if ((width <= bWidth && height <= bHeight) || height <= bHeight || width <= bWidth) {
                hideLeft();
            } else {
                showLeft();
                showFooter();
            }
            view.edit.resetBookScaleAndPosition();
        }
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {
        eModeChange : new Event()
    };
    exports.initEvent = initEvent;

    exports.setEditMode = setEditMode;
    exports.onEditescaleByWin = onEditescaleByWin;

});