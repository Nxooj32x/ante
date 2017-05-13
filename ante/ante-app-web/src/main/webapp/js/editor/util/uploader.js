define('editor/util/uploader', function(require, exports, module) {

    var qiniuDefaults = {
        runtimes: 'gears,html5,flash',
        flash_swf_url: '/js/lib/plupload/Moxie.swf',
        silverlight_xap_url: '/js/lib/plupload/Moxie.xap',
        dragdrop: true,
        chunk_size: '4Mb', // 分割上传，七牛那边会报上传错误：请求报文格式错误
        max_retries: 1,//当发生plupload.HTTP_ERROR错误时的重试次数
        filters: {
            //
            max_file_size: '30mb',
            prevent_duplicates: true //不允许选取重复文件
        },
        mime_types: 'image/*',
        auto_start: false
    };

   function Uploader (options, init) {
        /**
         * 所属ID
         */
        this.belongId = options.belongId;

        /**
         * 所属类型
         */
        this.belongType = 'book';

        this.bucket = options.bucket || 'yearbook-album';
        this.domain = options.domain || 'http://' + me.bucket + '.yearbook.com.cn/';

        init = $.extend({}, {
            'Error': function (up, err, errTip) {
                if (err.code === plupload.FILE_SIZE_ERROR) {
                    errTip = "图片太大了，换一个小的吧";
                    SureMsg.alert(errTip);
                } else {
                    console.log(errTip);
                }
            },
            'Key': function (up, file) {
                var uuid = file.md5 || new UUID().id;
                return "imageRes/" + uuid;
            }
        }, init);


        var tokenOpts = {
            uptoken_url: "/qiniu/upToken?scope=" + this.bucket
        };
        if (options.uptoken) {
            tokenOpts = {};
        }

        options = $.extend({}, qiniuDefaults, tokenOpts, options, {
            init: init
        });

        this.qiniuUploader = Qiniu.uploader(options);
    }

    Uploader.prototype.startUpload = function () {
        this.qiniuUploader.start();
    };

    Uploader.prototype.stopUpload = function () {
        this.qiniuUploader.stop();
    };

    module.exports = Uploader;

});