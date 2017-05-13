define("view/left", function(require, exports, module) {

    function init() {

    }

    function bind() {
        //切换left aside
        $('.aside_left .left_tab a, .aside_left .sub_tab > a').click(function () {
            var type = $(this).attr('data-type');
            $(this).addClass('active').siblings().removeClass('active');
            $('.aside_left .tab_body[data-type=' + type + ']').addClass('active').siblings().removeClass('active')
            $('.aside_left .tab_body[data-type=' + type + ']').maskLoading({
                time : 600,
                bgColor : '#3f464d',
                //check : function() {
                //    return isSubPageThumbnailOk;
                //},
                load : function() {
                }
            });

            if (type == 'template') {
                view.leftTemplate.init();
            }
        });
        //
        //if (isTpl) {
        //    $('.aside_left .left_tab a[data-type="pageList"]').show().trigger('click');
        //} else {
        //    $('.aside_left .left_tab a[data-type="photo"]').trigger('click');
        //}
        $('.aside_left .left_tab a[data-type="photo"]').trigger('click');
    }

    exports.init = init;
    exports.bind = bind;
    exports.events = {};

});