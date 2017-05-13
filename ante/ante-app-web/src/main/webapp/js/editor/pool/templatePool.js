define('editor/pool/templatePool', function (require, exports, module) {
    var allPageTemplate = [];
    function init(bookInfo) {
        Api.template.getAllPageTemplate(bookInfo.width, bookInfo.height, function(allPageTpl) {
            allPageTemplate = allPageTpl.data;
        });
    }

    function getAll(imgNum, type) {
        var retTpl = [];

        if (imgNum == undefined || imgNum == "all") {
            retTpl = allPageTemplate;
        } else if (imgNum == "n") {

            $.each(allPageTemplate, function(i, tpl) {
                if (tpl.resource.imageSlotList.length > 4) {
                    retTpl.push(tpl);
                }
            });
        } else {
            imgNum = parseInt(imgNum);

            $.each(allPageTemplate, function(i, tpl) {
                if (tpl.resource.imageSlotList.length == imgNum) {
                    retTpl.push(tpl);
                }
            });
        }

        if (type == undefined) {
            return retTpl;
        } else {
            var typeTpl =  [];
            $.each(retTpl, function(i, tpl) {
                if (tpl.type == type) {
                    typeTpl.push(tpl);
                }
            });
            return typeTpl;
        }
    }

    function add(pageTemplate) {
        allPageTemplate.unshift(pageTemplate);
    }

    function get(id) {
        for (var i = 0; i < allPageTemplate.length; i ++) {
            var pt = allPageTemplate[i];
            if (pt.id == id) {
                return pt;
            }
        }
    }

    function del(id) {
        for (var i = 0; i < allPageTemplate.length; i ++) {
            var pt = allPageTemplate[i];
            if (pt.id == id) {
                allPageTemplate.splice(i, 1);
            }
        }
    }

    exports.init = init;
    exports.getAll = getAll;
    exports.add = add;
    exports.del = del;
    exports.get = get;
});