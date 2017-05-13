define('view/pop/addPage', function(require, exports, module) {

    var Event = require("common/event/event");

    function init() {

    }

    function bind() {
        $('#addPageBox').unbind('click').on('click', '.j-save', function() {

            var addPageNum = $('#addPageBox #popAddPageNum').val();
            if (addPageNum == null) {
                addPageNum = 2;
            } else {
                addPageNum = parseInt(addPageNum);
                if (addPageNum % 2 == 1) {
                    addPageNum += 1;
                }
            }

            var addPostion = $('#addPageBox input[name="pagePosition"]:checked').val();

            opEvent.eAddPage.trigger(exports, {
                addPageNum : addPageNum,
                addPostion : addPostion
            });

            SureUtil.closeDialog('popAddPage');
        }).on('click', '.j-cancel', function() {
            SureUtil.closeDialog('popAddPage');
        });
    }

    function reload() {

    }

    function load() {

    }

    var events =  {
        ePopAddPage : new Event(),
        eAddPage : new Event()
    };

    function initEvent() {
        opEvent.ePopAddPage.register(function(e) {
            art.dialog({
                id : 'popAddPage',
                title:"添加页面",
                lock:true,
                padding:0,
                fixed:true,
                content:document.querySelector('#addPageBox')
            })
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;
    exports.events = events;
    exports.initEvent = initEvent;

});