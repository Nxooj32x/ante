define('editor/model/photo', function (require, exports, module) {
    var md5 = require("editor/util/md5");

    var _isTpl = true;

    if (typeof isTpl != 'undefined') {
        _isTpl = isTpl;
    }

    var _allPhoto = [];
    var _photo = {

        getById: function (id) {
            for (var i = 0; i < _allPhoto.length; i++) {
                if (_allPhoto[i].ir.checksum === id) {
                    return _allPhoto[i];
                }
            }
            return null;
        },

        delById: function (id) {
            for (var i = 0; i < _allPhoto.length; i++) {
                if (_allPhoto[i].ir.checksum === id) {
                    _allPhoto.splice(i, 1);
                }
            }
        },

        getPhotos: function () {
            return _allPhoto;
        },

        getPhotoInPage: function (pages) {
            if (!(pages instanceof Array)) {
                pages = [pages];
            }
            var photos = {};
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                if (page && page.imageSlotList) {
                    for (var j = 0; j < page.imageSlotList.length; j++) {
                        var imgSlot = page.imageSlotList[j];
                        if (imgSlot.image) {
                            photos[imgSlot.image.id] = _photo.getById(imgSlot.image.id);
                        }
                    }
                }
            }
            return photos;
        },

        getBookPhoto: function (bookId, callback) {

            var url = '/api/book/' + bookId + "/photo/?tpl=false";
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/?tpl=true";

            SureAjax.ajax({
                url: url,
                type: "GET",
                async: false,
                headers: {
                    Accept: "application/json"
                },

                success: function (page) {
                    _allPhoto = page.data;

                    //if (_allPhoto.length > 0) {
                    //    var _a = {};
                    //    $.each(_allPhoto, function(p) {
                    //        _a[p.ir.checksum] = p;
                    //    });
                    //    _allPhoto = _a;
                    //}

                    if (typeof callback == 'function') {
                        callback(_allPhoto);
                    }
                }
            });
        },

        addPhoto: function (bookId, name, desc, ir, callback) {
            var url = '/api/book/' + bookId + "/photo/?name=" + name + "&desc=" + desc + "&tpl=false";
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/?name=" + name + "&desc=" + desc + "&tpl=true";

            SureAjax.ajax({
                url: url,
                type: "POST",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(ir),
                success: function (il) {
                    _allPhoto.push(il);
                    callback(il);
                }
            });
        },

        getPhoto: function (bookId, checkSum, callback) {

            var url = '/api/book/' + bookId + "/photo/" + checkSum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checkSum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                contentType: 'application/json',
                dataType: "json",
                success: callback
            });
        },

        deletePhoto: function (bookId, checksum, callback) {
            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "DELETE",
                headers: {
                    Accept: "application/json"
                },
                success: function (response) {
                    if (typeof callback == 'function') {
                        callback(response);
                    }
                },
                parseError: false,
                error: function () {
                    SureMsg.msg("图片已经入册，不能删除 !");
                }
            });
        },


        deletePhotoByChecksum: function (bookId, checksum, callback) {

            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';

            SureAjax.ajax({
                url: url,
                type: "DELETE",
                headers: {
                    Accept: "application/json"
                },
                success: function (response) {
                    if (typeof callback == 'function') {
                        callback(response);
                    }
                },
                parseError: false,
                error: function () {
                    SureMsg.msg("图片已经入册，不能删除 !");
                }
            });
        },

        checkILByChecksum: function (checksum, bookId, found, notFound, isAddToBook) {

            var url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=false';
            if (_isTpl)
                url = '/api/book/' + bookId + "/photo/" + checksum + '?tpl=true';


            var il = null;
            var async = typeof(found) == "function";
            if (isAddToBook == false) {
                url = url + "?addToBook=false";
            }
            SureAjax.ajax({
                async: async,
                parseError: false,
                url: url,
                type: "GET",
                headers: {
                    Accept: "application/json"
                },
                success: function (ret) {
                    if (typeof(found) == "function")
                        found(ret);
                },
                error: function (ret) {
                    if (typeof(notFound) == "function")
                        notFound(ret);
                }
            });
            return il;
        },

        isILExist: function (file, bookId, existCb, noExistCb, isAddToBook) {
            md5.calMd5(file, function (md5) {
                var il = _photo.getById(md5);
                if (il != null) {
                    if (typeof(existCb) === "function")existCb(il);
                } else {
                    if (typeof(noExistCb) === "function")noExistCb(md5);
                }
            });
        }
    };

    return _photo;
});