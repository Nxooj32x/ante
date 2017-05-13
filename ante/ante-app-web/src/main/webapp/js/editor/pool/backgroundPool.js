define('editor/pool/backgroundPool', function (require, exports, module) {

    var Pool = require("editor/pool/pool");

    var type = "background";
    var bgPool;

    function init() {
        bgPool = new Pool(type);
    }

    function getUser() {
        return bgPool.getUser();
    }

    function getAdmin() {
        return bgPool.getAdmin();
    }

    function addOne(bg) {
        bgPool.add(bg)
    }

    function deleteOne(id) {
        bgPool.del(id);
    }

    function getById(id) {
        return bgPool.getById(id);
    }

    function getUserById(id) {
        return bgPool.getUserById(id);
    }

    function getByStyle(style) {
        return bgPool.getByStyle(style);
    }

    function getByTag(tag) {
        return bgPool.getByTag(tag);
    }

    function getUserByCode(md5) {
        return bgPool.getUserByCode(md5);
    }

    function isExist(file, bookId, existCb, noExistCb) {
        bgPool.isExist(file, bookId, existCb, noExistCb);
    }

    exports.init = init;
    exports.getUser = getUser;
    exports.getAdmin = getAdmin;
    exports.addOne = addOne;
    exports.deleteOne = deleteOne;
    exports.getById = getById;
    exports.getUserById = getUserById;
    exports.getByStyle = getByStyle;
    exports.getByTag = getByTag;
    exports.getUserByCode = getUserByCode;
    exports.isExist = isExist;
});