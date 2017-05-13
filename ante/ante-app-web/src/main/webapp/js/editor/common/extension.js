function checkIsTouchDevice() {
    return window.navigator.userAgent.indexOf('iPad') !== -1;
}
var isTouchDevice = checkIsTouchDevice();

Array.prototype.contains = function (value, funcCompare) {
    funcCompare = funcCompare || function (item) { return item; };

    for (var i = 0; i < this.length; i++) {
        if (funcCompare(this[i]) === funcCompare(value)) {
            return true;
        }
    }
    return false;
};

Array.prototype.where = function (funcWhere) {
    var results = [];
    for (var i = 0; i < this.length; i++) {
        if (funcWhere(this[i])) {
            results.push(this[i]);
        }
    }
    return results;
};

Array.prototype.remove = function (funcWhere) {
    var count = 0;
    var i;
    for (i = 0; i < this.length; i++) {
        if (funcWhere(this[i])) {
            this.splice(i, 1);
            count++;
            i--;
        }
    }
    return count;
};

Array.prototype.get = function (num) {
    var length = this.length,
        result = null;

    if (!length) return result;

    if (length <= num) {
        result = this.slice();

        while (length--) {
            this.shift();
        }

        return result;
    }

    result = this.slice(0, num);

    while (num--) {
        this.shift();
    }

    return result;
};

window.Blob && (Blob.prototype.slice = Blob.prototype.slice || Blob.prototype.webkitSlice);

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.setTimeout;
window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame
|| window.mozCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;

$.fn.oneAnimationEnd = function (animationend) {
    return this.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', animationend);
};
$.fn.offAnimationEnd = function () {
    return this.off('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd');
};
$.fn.oneTransitionEnd = function (transitionend) {
    return this.one('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd', transitionend);
};
$.fn.offTransitionEnd = function () {
    return this.off('transitionend webkitTransitionEnd MSTransitionEnd oTransitionEnd');
};

//将mousedown和touchstart事件抽象为pointerdown事件
if (!('onpointerdown' in window)) {
    $(document).on(isTouchDevice ? 'touchstart' : 'mousedown', function (e) {
        var event = $.Event('pointerdown');

        event.preventDefault = function () {
            e.preventDefault;
        };
        event.stopPropagation = function () {
            e.stopPropagation;
        };
        event.originalType = e.type;

        if (e.type === 'mousedown') {
            event.pageX = e.pageX;
            event.pageY = e.pageY;
        } else if (e.type === 'touchstart') {
            event.pageX = e.originalEvent.changedTouches[0].pageX;
            event.pageY = e.originalEvent.changedTouches[0].pageY;
        }

        $(e.target).trigger(event);
    });
    $(document).on(isTouchDevice ? 'touchend' : 'mouseup', function (e) {
        var event = $.Event('pointerup');

        event.preventDefault = function () {
            e.preventDefault;
        };
        event.stopPropagation = function () {
            e.stopPropagation;
        };
        event.originalType = e.type;

        if (e.type === 'mouseup') {
            event.pageX = e.pageX;
            event.pageY = e.pageY;
        } else if (e.type === 'touchend') {
            event.pageX = e.originalEvent.changedTouches[0].pageX;
            event.pageY = e.originalEvent.changedTouches[0].pageY;
        }

        $(e.target).trigger(event);
    });
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, tl, tr, br, bl) {
    var x1, x2, x3, x4, y1, y2, y3, y4, radii, ratio = 0,
        CURVE2KAPPA = 0.5522847498307934;
    ratio = Math.min(Math.min(width / (tl + tr), width / (br + bl)), Math.min(height / (tl + bl), height / (tr + br)));
    if ((ratio > 0) && (ratio < 1)) {
        tl *= ratio;
        tr *= ratio;
        bl *= ratio;
        br *= ratio;
    }
    xw = x + width;
    yh = y + height;
    x1 = x + tl;
    x2 = xw - tr;
    x3 = xw - br;
    x4 = x + bl;
    y1 = y + tr;
    y2 = yh - br;
    y3 = yh - bl;
    y4 = y + tl;
    this.beginPath();
    this.moveTo(x1, y);
    this.lineTo(x2, y);
    radii = CURVE2KAPPA * tr;
    this.bezierCurveTo(x2 + radii, y, xw, y1 - radii, xw, y1);
    this.lineTo(xw, y2);
    radii = CURVE2KAPPA * br;
    this.bezierCurveTo(xw, y2 + radii, x3 + radii, yh, x3, yh);
    this.lineTo(x4, yh);
    radii = CURVE2KAPPA * bl;
    this.bezierCurveTo(x4 - radii, yh, x, y3 + radii, x, y3);
    this.lineTo(x, y4);
    radii = CURVE2KAPPA * tl;
    this.bezierCurveTo(x, y4 - radii, x1 - radii, y, x1, y);
};
