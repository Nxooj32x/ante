define('common/size-converter/size-converter', function (require, exports, module) {
    function SizeConverter(dpi) {
        if (!dpi) {
            throw new Error('请给个dpi！');
        }
        this.DPI = dpi;
    }

    SizeConverter.prototype.mmToPx = function (mm) {
        return mm * this.DPI * (1 / 25.4);
    };

    SizeConverter.prototype.pxToMm = function (px) {
        return px / this.DPI / (1 / 25.4);
    };

    SizeConverter.prototype.mmToPt = function (mm) {
        return mm * (72 / 25.4);
    };

    SizeConverter.prototype.ptToMm = function (pt) {
        return pt * (25.4 / 72);
    };

    SizeConverter.prototype.ptToPx = function (pt) {
        return pt / 72 * this.DPI;
    };

    SizeConverter.prototype.pxToPt = function (px) {
        return px / this.DPI * 72;
    };

    module.exports = SizeConverter;
});