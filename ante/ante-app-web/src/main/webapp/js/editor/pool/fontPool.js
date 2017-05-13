define('editor/pool/fontPool', function (require, exports, module) {
    var Pool = require("editor/pool/pool");

    var type = "font";
    var fontPool;

    function init() {
        fontPool = new Pool(type);
    }

    function getFontById(id) {
        var fonts = fontPool.getAdmin();
        for (var i = 0; i < fonts.length; i ++) {
            var de = fonts[i];
            if (de.value == id) {
                return de;
            }
        }
        return null;
    }

    function getFontByName(name) {
        var fonts = fontPool.getAdmin();
        for (var i = 0; i < fonts.length; i ++) {
            var de = fonts[i];
            if (de.name == name) {
                return de;
            }
        }
        return null;
    }

    function getFontName(fontId) {
        var font = getFontById(fontId);
        if (font != null) {
            return font.name;
        }
    }

    function getFonts() {
        return fontPool.getAdmin();
    }

    exports.init = init;
    exports.getFontById = getFontById;
    exports.getFontByName = getFontByName;
    exports.getFontName = getFontName;
    exports.getFonts = getFonts;

});