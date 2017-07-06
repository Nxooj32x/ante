;(function(root,factory,$){
    if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.TwAjax = factory();
    }
})(this,function(){
    "use strict";

    var _TwAjax = {

    };

    return _TwAjax;
},jQuery);