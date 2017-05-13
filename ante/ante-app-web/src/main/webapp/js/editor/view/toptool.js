define("view/toptool", function(require, exports, module) {

    var Event = require("common/event/event");
    var $topToolContainer = $('#top-tool-container');

    function init(book) {
        initTopBookInfo(book.name, model.book.computeCompletedPercent());
    }

    function initTopBookInfo(name, percent) {
        $('#top-book-info .book_name').text("《" + name + "》");
        $('#top-book-info .percent > span').text(percent.toFixed(2) * 100 + "%");
    }

    function bind() {

        $('#showBookInfo').click(function(){
            art.dialog({
                id : 'editBookInfo',
                title: '作品基本信息',
                lock: true,
                fixed: true,
                content: document.querySelector('#tplInfoBox'),
                init:function(){

                    var bookInfo = model.book.getBookInfo();

                    $('#tplInfoBox .j-bookinfo[data-type="name"]').val(bookInfo.name);
                    $('#tplInfoBox .j-bookinfo[data-type="width"]').val(bookInfo.width);
                    $('#tplInfoBox .j-bookinfo[data-type="height"]').val(bookInfo.height);

//                $('.add_input .add_btn').click(function(){
//                    var newStyle = $(this).closest('.add_input').find('input').val(),
//                            styleBox = $(this).closest('.add_input').next();
//                    if(typeof(newStyle)!="undefined" && newStyle!=0){
//                        styleBox.prepend('<a href="javascript:;"><span class="ybiconfont ybicon-ok check"></span>' + newStyle + '</a>')
//                    }
//                });
//                $('.styles').on('click','a',function(){
//                    $(this).toggleClass('active')
//                })
                }
            });
        });

        $('#tplInfoBox').unbind('click').on('click', '.j-save', function() {

            var book = {};
            $('#tplInfoBox .j-bookinfo').each(function() {
                var type = $(this).attr('data-type');
                var value = $(this).val();

                book[type] = value;
            });

            if ((book.width != undefined && book.width != model.book.getBookInfo().width) ||
                (book.height != undefined && book.height != model.book.getBookInfo().height)) {
                SureMsg.confirm("修改了书册的尺寸，将会影响整个所有书页，确定修改？", function() {
                    opEvent.eChangeBookInfo.trigger(exports, {
                        book : book,
                        refresh : true
                    });
                    SureUtil.closeDialog('editBookInfo');
                }, function() {

                })
            } else {
                opEvent.eChangeBookInfo.trigger(exports, {
                    book : book,
                    refresh : false
                });
                SureUtil.closeDialog('editBookInfo');
            }
        }).on('click', '.j-cancel', function() {
            SureUtil.closeDialog('editBookInfo');
        });

        $topToolContainer.unbind('click').on('click', '.top-tool-btn', function(e) {
            e.stopPropagation();

            var btnOperation = $(this).attr('data-operation');

            switch (btnOperation) {
                case "btn-undo":
                    opEvent.ePageUndo.trigger(exports, {
                        pageSeq : view.edit.getActivePageSeq(),
                        operation : btnOperation
                    });
                    break;
                case "btn-redo":
                    opEvent.ePageRedo.trigger(exports, {
                        pageSeq : view.edit.getActivePageSeq(),
                        operation : btnOperation
                    });
                    break;
                case "btn-imageslot":
                    opEvent.eNewImageSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-textslot":
                    opEvent.eMewTextSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-shapeslot":
                    opEvent.eNewShapeSlotInsert.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-auto":
                    opEvent.eBookAutoComplete.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-check":
                    opEvent.eBookCheck.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
                case "btn-save":
                    opEvent.eBookSaving.trigger(exports, {
                        operation : btnOperation
                    });
                    break;
            }

        });

        $('.edit_toolbar').unbind('click').on('click', '.top-tool-btn', function() {
            var opt = $(this).attr('data-operation');
            if (opt == 'btn-preview') {
                var from = $('body').attr('data-mode');
                var to = "preview-book";
                if (from == to) {
                    to = "edit-book";
                }
                opEvent.eModeChange.trigger(exports, {
                    from : from,
                    to : to
                });
            }
            if (opt == 'btn-publish') {
                SureMsg.confirm("确定发布书册？点击确定之后会批量处理缩略图。", function() {
                    SureMsg.showLoadBar("生成缩略图中...");
                    opEvent.eBookPublish.trigger(exports, {
                        isCreateThumb : true,
                        onSuccess : function() {
                            SureMsg.hideLoadBar();
                        }
                    });
                }, function() {

                });
            }
        });
    }

    //使能按钮
    function enableBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').attr('disabled', false);
    }

    //禁用按钮
    function disableBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').attr('disabled', true);
    }

    //激活按钮
    function activeBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').addClass('active');
    }

    //不激活按钮
    function inactiveBtn(name) {
        $topToolContainer.find('.top-tool-btn[data-operation="' + name + '"]').removeClass('active');
    }

    var events = {
        eBookAutoComplete : new Event(),
        eSavePageRes : new Event(),
        ePageUndo: new Event(),
        ePageRedo: new Event(),
        eBookSaving: new Event(),
        eBookCheck : new Event(),
        eBookPublish : new Event()
    };

    function initEvent() {
        opEvent.eChangeBookInfo.register(function(e) {
            var book = e.book;
            if (book.name != undefined) {
                $('#top-book-info .book_name').text("《" + book.name + "》");
            }
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = events;
    exports.initEvent = initEvent;

    exports.enable = enableBtn;
    exports.disable = disableBtn;
    exports.active = activeBtn;
    exports.inactive = inactiveBtn;

});