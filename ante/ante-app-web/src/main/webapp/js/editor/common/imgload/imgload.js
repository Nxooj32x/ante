define('common/imgload/imgload', function (require, exports, module) {
    function imgload(url, onready) {
        var img = document.createElement('img');

        img.src = url;

        if (img.complete || img.width * img.height > 0) {
            onready.call(img, img.width, img.height);
            return;
        }

        var clockToken = setInterval(function () {
            if (img.complete || img.width * img.height > 0) {
                onready.call(img, img.width, img.height);
                clearInterval(clockToken);
            }
        }, 1000 / 60);
    }

    module.exports = imgload;
});