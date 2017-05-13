define('editor/model/index', function (require, exports, module) {
    var SizeConverter = require('common/size-converter/size-converter');

    return {
        book : require('editor/model/book'),
        photo : require('editor/model/photo'),
        definitionSizeConverter: new SizeConverter(250)
    };
});