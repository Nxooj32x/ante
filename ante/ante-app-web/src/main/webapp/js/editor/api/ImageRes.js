define('editor/api/ImageRes', function (require, exports, module) {
    var baseUrl = "/api/imageRes/";

    var md5 = require("editor/util/md5");

    var ir = {
        addIR: function (ir, callback) {
            SureAjax.ajax({
                url: baseUrl,
                type: "POST",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(ir),
                success: callback
            });
        },

        getIRByChecksum: function (checksum, found, notFound) {
            var ir = null;
            var async = typeof(found) == "function";
            SureAjax.ajax({
                async: async,
                parseError: false,
                url: baseUrl + "checksum/" + checksum,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")notFound();
                }
            });
            return ir;
        },

        getImageExif: function (irId, found) {
            var ir = null;
            SureAjax.ajax({
                url: baseUrl + irId + "/exif",
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")notFound();
                }
            });
            return ir;
        },

        toDate: function (str) {
            // 2015-12-10 17:18:02 -->  2015/12/10 17:18:02
            var strs = str.replace(':', '/').replace(':', '/');
            return new Date(strs);
        },

        /**
         * 通过七牛文件构建ImageRes对象
         * @param up
         * @param file
         * @param res
         * @param exif
         */
        createIRFromQiniu: function (up, file, res, exif) {
            var ir = {};
            exif = exif || {};
            var domain = up.getOption('domain');
            Qiniu.domain = domain;
            var imageInfo = Qiniu.imageInfo(res.key);
            if (domain.charAt(domain.length - 1) == "/") {
                domain = domain.substring(0, domain.length - 1);
            }
            var url = domain + "/" + encodeURI(res.key);
            ir.name = file.name;
            ir.src = url;
            ir.uploadTime = new Date();
            ir.checksum = file.md5;
            var photoTime = exif.DateTime || exif.DateTimeOriginal;
            ir.photoTime = photoTime ? ir.toDate(photoTime) : null;
            ir.format = imageInfo.format;
            ir.width = imageInfo.width;
            ir.height = imageInfo.height;
            ir.colorModel = imageInfo.colorModel;
            ir.linkNum = 0;
            if (exif.Model)
                ir.model = exif.Model;
            else if (exif.Software)
                ir.model = exif.Software;
            ir.exif = {
                checksum: ir.checksum,
                jsonExif: JSON.stringify(exif)
            };
            return ir;
        },

        isIRExist: function (file, existCb, noExistCb) {
            md5.calMd5(file, function (md5) {
                ir.getIRByChecksum(md5, function (ret) {
                    if (ret) {
                        if (typeof(existCb) === "function")existCb(ret);
                    }
                }, function () {
                    if (typeof(noExistCb) === "function")noExistCb(md5);
                });
            });
        }
    };

    return ir;
});