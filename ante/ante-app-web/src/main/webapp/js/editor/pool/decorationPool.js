define('editor/pool/decorationPool', function (require, exports, module) {
    var Pool = require("editor/pool/pool");

    var type = "decoration";
    var dePool;

    function init() {
        dePool = new Pool(type);
    }

    function getUser() {
        return dePool.getUser();
    }

    function getAdmin() {
        return dePool.getAdmin();
    }

    function addOne(decoration) {
        dePool.add(decoration)
    }

    function deleteOne(id) {
        dePool.del(id);
    }

    function getById(id) {
        return dePool.getById(id);
    }

    function getUserById(id) {
        return dePool.getUserById(id);
    }

    function getByStyle(style) {
        return dePool.getByStyle(style);
    }

    function getByTag(tag) {
        return dePool.getByTag(tag);
    }

    function getUserByCode(md5) {
        return dePool.getUserByCode(md5);
    }

    function isExist(file, bookId, existCb, noExistCb) {
        dePool.isExist(file, bookId, existCb, noExistCb);
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