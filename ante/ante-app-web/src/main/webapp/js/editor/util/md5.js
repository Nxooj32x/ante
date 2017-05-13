define('editor/util/md5', function(require, exports, module) {
    var calMd5 = function (file, cb) {

        try {
            //文件分割方法（注意兼容性）
            var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice;

            //最小需要截取部分进行MD5计算的文件大小 1MB
            var minNeedSliceSize = 1048576;

            //取前后及中间多少字节进行MD5计算
            var len = 50;

            var blob;
            if (minNeedSliceSize < file.size) {
                var file1 = blobSlice.call(file, 0, len);
                var file2 = blobSlice.call(file, file.size / 2 - len, file.size / 2 + len);
                var file3 = blobSlice.call(file, file.size - len, file.size);
                blob = new Blob([file1, file2, file3])
            } else {
                blob = new Blob([blobSlice.call(file, 0, file.size)]);
            }

            var fileReader = new FileReader();
            //创建md5对象（基于SparkMD5）
            var spark = new SparkMD5();
            fileReader.onload = function (e) {
                spark.appendBinary(e.target.result);
                var md5 = spark.end();
                if (typeof(cb) === "function") {
                    cb(md5);
                }
            };

            fileReader.readAsDataURL(blob);
        } catch (e) {
            console.log(e);
            this.calMd5_fullFile(file, cb);
        }

    };
    var calMd5FullFile =  function (file, cb) {
        //文件分割方法（注意兼容性）
        var blobSlice = File.prototype.mozSlice || File.prototype.webkitSlice || File.prototype.slice,
        //2M分割
            chunkSize = 2097152,
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,

        //创建md5对象（基于SparkMD5）
            spark = new SparkMD5();

        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            //每块交由sparkMD5进行计算
            spark.appendBinary(e.target.result);
            currentChunk++;

            //如果文件处理完成计算MD5，如果还有分片继续处理
            if (currentChunk < chunks) {
                loadNext();
            } else {
                var md5 = spark.end();
                if (typeof(cb) === "function") {
                    cb(md5);
                }
            }
        };
        //处理单片文件的上传
        function loadNext() {
            var start = currentChunk * chunkSize, end = start + chunkSize >= file.size ? file.size : start + chunkSize;

            if ("readAsBinaryString" in fileReader)
                fileReader.readAsBinaryString(blobSlice.call(file, start, end));
            else
                fileReader.readAsText(blobSlice.call(file, start, end));
        }

        loadNext();
    };

    exports.calMd5 = calMd5;
    exports.calMd5FullFile = calMd5FullFile;
});