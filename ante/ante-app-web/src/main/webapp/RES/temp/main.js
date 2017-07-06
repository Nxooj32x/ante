;(function(root,factory){
    if (typeof define === 'function' && define.cmd) {
        define('other',factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.View = factory();
    }
})(this,function(){
    return {out:"hello world"};
});
define('tool',function(require,exports,module){
    module.exports = {
        toString:function(){
            console.dir("toString");
        }
    }
});
define('two',function(require,exports,module){
    module.exports = {
        print:function(){
            console.dir(222);
        }
    }
});
define('one',['two'],function(require,exports,module){
    var two = require('two');
    module.exports = {
        alert:function(){
            console.dir(111);
        }
    }
});
define('begin',['one','two','tool','other'],function(require,exports,module){
    var one = require('one');
    var two = require('two');
    var tool = require('tool');
    tool.toString();
    var other = require('other');
    console.dir(other);
    one.alert();
});
seajs.use('begin');

