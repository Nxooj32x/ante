define('editor/slot/defalutSlot', function (require, exports, module) {

    function defalut() {
        console.log("槽位类型出错！");
    }

    exports.template = defalut;
    exports.create = defalut;
    exports.getAttr = defalut;
    exports.setAttr = defalut;
});