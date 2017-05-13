define('editor/api/template', function (require, exports, module) {
    //var  SureAjax = require("common/api/ajax");
    //var  SureUtil = require("common/base/util");

    var level = {
        user : "U",
        admin : "A"
    };

    function addPageTemplate(pageTemplate, callback) {
        pageTemplate.createUserId =  SureUtil.getLoginId();
        pageTemplate.createUserName = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/pt/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(pageTemplate),
            success: callback
        });
    }

    function getOnePageTemplate(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function updatePageTemplate(ptId, newPt, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newPt),
            success: callback
        });
    }

    function delPageTemplate(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function getAllPageTemplate(width, height, callback) {
        SureAjax.ajax({
            url: "/api/pt/?width=" + width + "&height=" + height,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function savePtr(ptId, ptr, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId + "/resource",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(ptr),
            success: callback
        });
    }

    function getPtr(ptId, callback) {
        SureAjax.ajax({
            url: "/api/pt/" + ptId + "/resource",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function addBookTemplate(bookTemplate, callback, copyId) {
        if (copyId != undefined) {
            SureAjax.ajax({
                url: "/api/bt/?copy=" + copyId,
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(bookTemplate),
                success: callback
            });
        } else {
            SureAjax.ajax({
                url: "/api/bt/",
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(bookTemplate),
                success: callback
            });
        }
    }

    function getAllBookTemplate(callback) {
        SureAjax.ajax({
            url: "/api/bt/",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function delBookTemplate(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function updateBookTemplate(btId, newBt, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newBt),
            success: callback
        });
    }

    function getOneBookTemplate(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function saveBtr(btId, btr, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId + "/resource",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(btr),
            success: callback
        });
    }

    function getBtr(btId, callback) {
        SureAjax.ajax({
            url: "/api/bt/" + btId + "/resource",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    function getUserBookTemplate(callback) {
        var userId = SureUtil.getLoginId();
        SureAjax.ajax({
            url: "/api/user/" + userId + "/bt/",
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            success: callback
        });
    }

    exports.addPageTemplate = addPageTemplate;
    exports.updatePageTemplate = updatePageTemplate;
    exports.getPageTemplate = getOnePageTemplate;
    exports.getAllPageTemplate = getAllPageTemplate;
    exports.delPageTemplate = delPageTemplate;
    exports.savePtr = savePtr;
    exports.getPtr = getPtr;

    exports.addBookTemplate = addBookTemplate;
    exports.getBookTemplate = getOneBookTemplate;
    exports.updateBookTemplate = updateBookTemplate;
    exports.delBookTemplate = delBookTemplate;
    exports.getAllBookTemplate = getAllBookTemplate;

    exports.getUserBookTemplate = getUserBookTemplate;

    exports.saveBtr = saveBtr;
    exports.getBtr = getBtr;

});


