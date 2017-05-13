define("me/opevent/opEvent", function (require, exports, module) {

    var _event = {};

    function addEvent(events) {
        $.extend(exports, events);
        _event = exports;
    }

    function getEvent(event) {
        var te = _event[event];
        if (te != undefined) {
            return te;
        } else {
            throw Error( event + " 不存在");
        }
    }

    function triggerEvent(event, args) {
        var te = getEvent(event);
        te.trigger(exports, args);
    }

    function registerEvent(event, func) {
        var te = getEvent(event);
        te.register(func);
    }

    exports.add = addEvent;
    exports.get = getEvent;
    exports.trigger = triggerEvent;
    exports.register = registerEvent;
});