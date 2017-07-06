;(function(root,factory){
    if (typeof define === 'function' && define.cmd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.View = factory();
    }
})(this,function(){
    return {out:"hello world"};
});