define('editor/api/material', function (require, exports, module) {
    //var  SureAjax = require("common/api/ajax");
    //var  SureUtil = require("common/base/util");

    var level = {
        user : "U",
        admin : "A"
    };

    function addMaterial(material, callback) {
        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function addUserMaterial(material, callback) {

        material["level"] = level.user;

        material["createUserId"] = SureUtil.getLoginId();
        material["createUserName"] = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function addAdminMaterial(material, callback) {

        material["level"] = level.admin;

        material["createUserId"] = SureUtil.getLoginId();
        material["createUserName"] = SureUtil.getLoginUserName();

        SureAjax.ajax({
            url: "/api/material/",
            type: "POST",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(material),
            success: callback
        });
    }

    function updateOneMaterial(matId, newMaterial, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "PUT",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: JSON.stringify(newMaterial),
            success: callback
        });
    }

    function delOneMaterial(matId, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "DELETE",
            headers : {
                Accept : "application/json"
            },
            contentType : 'application/json',
            dataType : "json",
            data: {},
            success: callback
        });
    }

    function getOneMaterial(matId, callback) {
        SureAjax.ajax({
            url: "/api/material/" + matId,
            type: "GET",
            headers : {
                Accept : "application/json"
            },
            dataType: "json",
            success: callback
        });
    }


    function getUserMaterialByType(type, start, limit, callback) {

        var loginUserId = SureUtil.getLoginId();

        SureAjax.ajax({
            url: "/api/user/" + loginUserId + "/material",
            type: "GET",
            async : false,
            headers: {
                Accept: "application/json"
            },
            dataType: "json",
            data: {
                t: type,
                start: start,
                limit: limit
            },
            success: callback
        });
    }

    function getAdminMaterialByType(type, start, limit, callback) {

        SureAjax.ajax({
            url: "/api/admin/material",
            type: "GET",
            headers: {
                Accept: "application/json"
            },
            async : false,
            dataType: "json",
            data: {
                t: type,
                start: start,
                limit: limit
            },
            success: callback
        });
    }

    function createDecoration(ir) {
        var m = {};

        m.value = ir.src;
        m.type = 'decoration';
        m.code = ir.checksum;
        m.name = ir.name;
        m.width = ir.width;
        m.height = ir.height;
        m.url = ir.url;

        return m;
    }

    function createBackground(ir) {
        var m = {};

        m.value = ir.src;
        m.type = 'background';
        m.code = ir.checksum;
        m.name = ir.name;
        m.width = ir.width;
        m.height = ir.height;
        m.url = ir.src;

        return m;
    }


    exports.add = addMaterial;
    exports.addUser = addUserMaterial;
    exports.addAdmin = addAdminMaterial;
    exports.update = updateOneMaterial;
    exports.del = delOneMaterial;
    exports.get = getOneMaterial;
    exports.getByType = getUserMaterialByType;
    exports.getAdminByType = getAdminMaterialByType;

    exports.createDecoration = createDecoration;
    exports.createBackground = createBackground;

});


