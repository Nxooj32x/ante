define('editor/pool/pool', function (require, exports, module) {
    var md5 = require("editor/util/md5");
    var material = require('editor/api/material');

    function Pool(type) {

        this.user = [];
        this.admin = [];

        this.tags = [];
        this.datasByTag = {};

        this.styles = [];
        this.datasByStyle = {};

        var me = this;

        material.getByType(type, 0, -1, function(user) {
            me.user = user.data;
        });
        material.getAdminByType(type, 0, -1, function(admin) {
            me.admin = admin.data;
            me.analysis();
        });
    }

    Pool.prototype.analysis = function() {
        var datas = this.admin;
        var me = this;
        $.each(datas, function(i, data) {
            var tag = data.tag;
            var style = data.style;

            if (tag != null) {
                tag = tag.split(',');
            } else {
                tag = [];
            }
            $.each(tag, function(j,t) {
                if ($.inArray(t, me.tags) < 0) {
                    me.tags.push(t);
                }
                var tagDatas = me.datasByTag[t];
                if (tagDatas == undefined) {
                    me.datasByTag[t] = [];
                }
                me.datasByTag[t].push(data);
            });

            if (style != null) {
                style = style.split(',');
            } else {
                style=[];
            }
            $.each(style, function(j,s) {
                if ($.inArray(s, me.styles) < 0) {
                    me.styles.push(s);
                }
                var styleDatas = me.datasByStyle[s];
                if (styleDatas == undefined) {
                    me.datasByStyle[s] = [];
                }
                me.datasByStyle[s].push(data);
            });
        });
    };

    Pool.prototype.getByTag = function(tag) {
        if (tag == "全部" || tag == "all") {
            return this.admin;
        } else {
            var find =  this.datasByTag[tag];
            if (find != undefined) {
                return find;
            } else {
                return [];
            }
        }
    };

    Pool.prototype.getByStyle = function(style) {
        var find =  this.datasByStyle[style];
        if (find != undefined) {
            return find;
        } else {
            return [];
        }
    };

    Pool.prototype.getUser = function() {
        return this.user;
    };

    Pool.prototype.getAdmin = function() {
        return this.admin;
    };

    Pool.prototype.add = function(material) {
        if (material.level == 'U') {
            this.user.unshift(material);
        } else {
            this.admin.unshift(material);
        }
    };

    Pool.prototype.del = function(id) {
        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.id == id) {
                this.user.splice(i, 1);
            }
        }
    };

    Pool.prototype.getById = function(id)  {
        var find = this.getUserById(id);
        if (find == null) {
            find = this.getAdminById(id);
        }
        return find;
    };

    Pool.prototype.getAdminById = function(id)  {

        for (var i = 0; i < this.admin.length; i ++) {
            var de = this.admin[i];
            if (de.id == id) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.getUserById = function(id)  {

        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.id == id) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.getUserByCode = function(md5) {

        for (var i = 0; i < this.user.length; i ++) {
            var de = this.user[i];
            if (de.code == md5) {
                return de;
            }
        }
        return null;
    };

    Pool.prototype.isExist = function(file, bookId, existCb, noExistCb) {
        var me = this;
        md5.calMd5(file, function (md5) {
            var bg = me.getUserByCode(md5);
            if (bg != null) {
                if (typeof(existCb) === "function")existCb(bg);
            } else {
                if (typeof(noExistCb) === "function")noExistCb(md5);
            }
        });
    };

    module.exports = Pool;
});