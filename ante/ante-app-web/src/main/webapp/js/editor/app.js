define('editor/app', function (require, exports, module) {

    var Api = {
        getBookInfo : function(bookId, cb) {
            var url = "/api/book/info/" + bookId + "?type=tpl";
            if (!isTpl) {
                url = "/api/book/info/" + bookId + "?type=book";
            }

            SureAjax.ajax({
                url: url,
                type: "GET",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                success: function(bi) {
                    cb(bi);
                }
            });
        },

        updateBook : function(cb) {
            SureAjax.ajax({
                url: "/api/book/info/",
                type: "POST",
                headers : {
                    Accept : "application/json"
                },
                contentType : 'application/json',
                dataType : "json",
                data: JSON.stringify(model.book.getBookInfo()),
                success: function() {
                    if (typeof cb == 'function') {
                        cb();
                    }
                }
            });
        },

        material : require("editor/api/material"),
        template : require("editor/api/template"),
        imageRes : require("editor/api/ImageRes")
    };


    var App = {
        data : {},
        init : function() {

            var bookId =  App.getParameterByName("bid");
            if (typeof curBookId != 'undefined') {
                bookId = curBookId;
            }
            if (!_.isNumber(parseInt(bookId))) {
                SureMsg.alert("参数不正确");
                return;
            }

            App.data.bookId = bookId;

            Api.getBookInfo(bookId, function(bookInfo) {
                App.data.book = bookInfo;

                App.initView();
            });
        },

        initView : function() {
            //设置全局变量
            App.setGlobalVariable();
            //初始化视图东东
            View.init();
        },

        //获取url参数值
        getParameterByName: function (name) {
            var match = RegExp('[?&]' + name + '=([^&]*)')
                .exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        },
        //截取url参数
        getParameter: function (num) {
            var url = window.location.href;
            url = url.split("?")[0].split("#")[0];
            var parameter = url.split("/")[url.split("/").length - num].toLowerCase();
            return parameter;
        },

        setGlobalVariable : function() {

        }
    };

    var Pool = {
        init : function(bookInfo) {
            var decorationPool = require('editor/pool/decorationPool');
            var backgroundPool = require('editor/pool/backgroundPool');
            var templatePool = require('editor/pool/templatePool');
            var fontPool = require('editor/pool/fontPool');

            decorationPool.init(bookInfo);
            backgroundPool.init(bookInfo);
            templatePool.init(bookInfo);
            fontPool.init(bookInfo);

            window.decorationPool = decorationPool;
            window.backgroundPool = backgroundPool;
            window.templatePool = templatePool;
            window.fontPool = fontPool;

            window.Pool = {
                decoration : decorationPool,
                background : backgroundPool,
                template : templatePool,
                font : fontPool
            }
        }
    };


    var View = {
        init : function() {
            var presenter = require('editor/presenter'),
                view = require('editor/view');
            var opEvent = require('editor/opEvent');
            var model = require('editor/model/index');

            //初始化编辑器
            window.view = view;
            window.opEvent = opEvent;
            window.presenter = presenter;
            window.model = model;

            window.Api = Api;
            window.App = App;

            Pool.init(App.data.book);

            model.book.init(App.data.book);
            model.photo.getBookPhoto(App.data.book.id);

            view.init(App.data.book);
            presenter.init(App.data.book);
        }
    };

    App.init();

});
