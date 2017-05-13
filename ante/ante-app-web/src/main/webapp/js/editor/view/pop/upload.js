define("view/pop/upload", function(require, exports, module) {

    var Event = require("common/event/event");
    var Uploader = require("editor/util/uploader");
    var imageRes = require("editor/api/ImageRes");

    var imageUp = null;
    var upQueue = [];
    var currentUpQueue = [];

    var onUploadCb = function () {};
    var onCloseCb = function () {};
    var checkExist = function() {
        return false;
    } ;

    function getObjectURL(file) {
        var url = null;
        if (window.createObjectURL != undefined) { // basic
            url = window.createObjectURL(file);
        } else if (window.URL != undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file);
        } else if (window.webkitURL != undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file);
        }
        return url;
    }

    function getBlobFileSrc(file) {
        var src;
        if (typeof file.getNative != 'undefined')
            src = getObjectURL(file.getNative());
        else
            src = getObjectURL(file);
        return src;
    }

    function buildWaitUpFileDiv(src) {
        src = getObjectURL(src);
        var progressli = '<li class="waitUp">';
        progressli += '<a href="javascript:;">';
        progressli += '	<img src="' + src + '" class="cm_cp">';
        progressli += '</a>';
        progressli += '<div class="load_per uploading">上传<span>0%</span></div>';
        progressli += '</li>';

        return progressli;
    }

    function buildUpImageLinkDiv(file, src) {
        src = src || getObjectURL(file.getNative());

        var progressli = "<li  id=" + file.id + ">";
        progressli += "	<a class='preview' href='javascript:;'><img src='" + src + "'></a>";
        progressli += '<div class="load_per uploading">等待中</div>';
        progressli += "</li>";
        return progressli;
    }

    function buildImageLinkDiv(il) {
        var isS = "selected";
        var ir = il.ir;

        if (ir == undefined) {
            ir = il;
        }
        var ilDiv = '<li ilId="' + ir.checksum + '">' +
            '<a class="' + isS + '" href="javascript:;">' +
            '<img src="' + ir.src + '?imageView2/1/w/125/h/125/format/jpg" class="cm_cp">' +
            '<span class="ybiconfont ybicon-ok"></span>' +
            '</a></li>';
        return ilDiv;
    }

    function uploadOK(il) {
        var ilDiv = buildImageLinkDiv(il);
        $('#imageLink_upload_container .new_up .photo_list').prepend(ilDiv);
        $('#imageLink_upload_container .tips .up_num').removeClass('hidden');
        var num = $('#imageLink_upload_container .tips span').eq(0).text();
        num++;
        $('#imageLink_upload_container .tips span').eq(0).text(num);
    }


    //页面初始化
    function init() {
        upQueue = [];
        currentUpQueue = [];

        var belongId = "1";
        if (typeof model != 'undefined') {
            belongId = model.book.getBookId()
        }

        if (imageUp == null) {
            SureAjax.ajax({
                url : '/qiniu/upToken?scope=' + qiniu_book_bucket,
                success : function(ret){
                    imageUp = new Uploader({
                        belongId: belongId,
                        bucket: qiniu_book_bucket,
                        domain: qiniu_book_domain,
                        uptoken: ret.uptoken,
                        browse_button: 'localFile_more',
                        container: 'upload',
                        drop_element: 'upload'
                    }, {
                        'FilesAdded': function (up, files) {
                            var needUp = files.length > 12 ? 12 : files.length;
                            $('#imageLink_upload_container .choose_img_con').removeClass('hidden');
                            $('#imageLink_upload_container .uploading').removeClass('hidden').removeClass('finished');
                            $('#imageLink_upload_container .to_upload').removeClass('hidden');
                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(files.length + upQueue.length);
                            $('.to_upload .photo_list .waitUp').remove();
                            $('#imageLink_upload_container .empty').addClass('hidden');
                            $('#imageLink_upload_container .choose_img_con .img_con').removeClass('hidden');
                            $("#imageLink_upload_container .complete").hide();

                            var i = 0;
                            plupload.each(files, function (file) {
                                if (i++ > 11) {
                                    upQueue.push(file.getNative());
                                    up.removeFile(file);
                                    return true;
                                }
                                file.name = file.name.replace(/\s+/g, "");
                                var name_len = file.name.length;
                                //验证图片名称长度，要求小于50
                                if (name_len > 50) {
                                    file.name = file.name.substr(0, 50);
                                }
                                var progressli = buildUpImageLinkDiv(file);
                                $('.to_upload .photo_list').append(progressli);
                            });
                            i = 0;
                            setTimeout(function () {
                                plupload.each(files, function (file) {
                                    if (i++ > 11) {
                                        return false;
                                    }
                                    setTimeout(function () {
                                        checkExist(file.getNative(), belongId, function (il) {
                                            var ir = il.ir;

                                            if (ir == undefined) {
                                                ir = il;
                                            }

                                            up.removeFile(file);
                                            $("#" + file.id).remove();
                                            var wn = $('#imageLink_upload_container .to_upload .title .cm_fl span').text();
                                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(wn - 1);
                                            if (upQueue.length > 0) {
                                                var nextFile = upQueue.shift();
                                                currentUpQueue.push(nextFile);
                                                var progressli = buildWaitUpFileDiv(nextFile);
                                                $('.to_upload .photo_list').append(progressli);
                                            }
                                            needUp--;
                                            if ($(".new_up li[ilId=" + ir.checksum + "]").length > 0) {
                                                SureMsg.msg("已经存在一张同样的图片了 ");
                                            } else {
                                                uploadOK(il);
                                            }
                                            if (needUp == 0) {
                                                up.start();
                                            }
                                        }, function (md5) {
                                            file.md5 = md5;
                                            needUp--;
                                            if (needUp == 0) {
                                                up.start();
                                            }
                                        });
                                    }, 100);
                                });
                            }, 500);
                        },
                        'UploadProgress': function (up, file) {
                            var shadeHeight = 125 * (1 - parseFloat(file.percent) / 100);
                            $("#" + file.id).find('.load_per').html('上传<span>' + file.percent + '%</span>');
                            $("#" + file.id).find('.load_per').height(shadeHeight);
                        },
                        'FileUploaded': function (up, file, info) {
                            var nextFile = null;
                            if (upQueue.length > 0) {
                                nextFile = upQueue.shift();
                                currentUpQueue.push(nextFile);
                            }
                            // 每个文件上传成功后,处理相关的事情
                            var res = $.parseJSON(info);
                            var img = $("#" + file.id).find("img")[0];
                            var wn = $('#imageLink_upload_container .to_upload .title .cm_fl span').text();
                            $('#imageLink_upload_container .to_upload .title .cm_fl span').text(wn - 1);

                            var exif = {};
                            EXIF.getData(img, function () {
                                exif = EXIF.getAllTags(this);
                            });

                            $("#" + file.id).remove();
                            if (nextFile != null) {
                                var progressli = buildWaitUpFileDiv(nextFile);
                                $('.to_upload .photo_list').append(progressli);
                            }
                            var ir = imageRes.createIRFromQiniu(up, file, res, exif);
                            !!onUploadCb && onUploadCb(ir, function(ret) {
                                uploadOK(ret);
                            });
                        },
                        'UploadComplete': function (up) {
                            if (currentUpQueue.length > 0) {
                                up.addFile(currentUpQueue);
                                currentUpQueue = [];
                            } else {
                                $('#imageLink_upload_container .uploading').addClass('finished');
                                $('#imageLink_upload_container .to_upload').addClass('hidden');
                                $("#imageLink_upload_container .complete").show();

                                !!onCloseCb && onCloseCb();
                            }
                        }
                    });
                }
            });
        }
    }

    //页面内事件绑定
    function bind() {
        $("#imageLink_upload_container").unbind('click').on('click', ".finish", function () {
            SureUtil.closeDialog('imageLinkUpload');
        }).on('click', ".empty a.btn", function () {
            $("#imageLink_upload_container input[type=file]").trigger('click');
        });

        if ($.os.mobile) {
            $("#imageLink_upload_container #localFile_more").unbind('click').on('click', function () {
                $("#imageLink_upload_container input[type=file]").trigger('click');
            });
        }
    }

    function popUploadDialog(e) {
        onUploadCb = e.onUpload;
        onCloseCb = e.onClose;
        checkExist = e.check;

        var finishName = e.finishBtnName;
        if (!!finishName) {
            $('.finishBtnName').text(finishName);
        }

        art.dialog({
            id: "imageLinkUpload",
            title: '上传图片',
            lock: true,
            content: document.getElementById('imageLink_upload_container'),
            close: function () {
                if (imageUp != null) {
                    imageUp.stopUpload();
                    imageUp.qiniuUploader.destroy();
                    imageUp = null;
                }

                !!onCloseCb && onCloseCb();
            },
            init: function () {
                $('#imageLink_upload_container .choose_img_con').addClass('hidden');
                $('#imageLink_upload_container .empty').removeClass('hidden');
                $('#imageLink_upload_container .tips .up_num span').text(0);
                $('#imageLink_upload_container .tips .up_num').addClass('hidden');
                $('#imageLink_upload_container .uploading .photo_list').empty();
                $('#imageLink_upload_container .to_upload .photo_list').empty();

                init();
            }
        });
    }

    //页面重置
    function reload() {

    }

    //页面加载
    function load() {

    }

    //页面内定义的事件
    var events =  {
        ePopUpload : new Event()
    };

    function initEvent() {
        events.ePopUpload.register(function(e) {
            popUploadDialog(e);
        });
    }

    exports.init = init;
    exports.bind = bind;
    exports.load = load;
    exports.reload = reload;

    exports.events = events;
    exports.initEvent = initEvent;

    exports.popUploadDialog = popUploadDialog;

});
