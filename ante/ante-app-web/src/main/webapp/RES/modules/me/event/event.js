define('me/event/event', function (require, exports, module) {
    module.exports = Event;

    function Event() {
        this.funcList = [];
    }

    Event.prototype.trigger = function (sender, e) {
        for (var i = 0; i < this.funcList.length; i++) {
            this.funcList[i].call(sender, e);
        }
        return this;
    };

    Event.prototype.register = function (func) {
        this.funcList.push(func);
        return this;
    };

    Event.prototype.unregister = function (func) {
        for (var i = 0; i < this.funcList.length; i++) {
            if (this.funcList[i] === func) {
                this.funcList.splice(i, 1);
            }
        }
        return this;
    };
});