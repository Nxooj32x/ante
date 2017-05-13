/**
 * Created by tao on 2017/4/29.
 */
define("me/view/test",function(require, exports, module){

    var Event = require("me/event/event");
    function initEvent() {
        opEvent.eModeChange.register(function(e) {
            console.dir(e);
        });
    }

    exports.events = {
        eModeChange : new Event()
    };
    exports.initEvent = initEvent;

});