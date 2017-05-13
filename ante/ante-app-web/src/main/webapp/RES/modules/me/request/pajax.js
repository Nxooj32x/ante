define("me/request/pajax",function (require, exports, module) {
    $(document).on('pjax:send', function () {
        NProgress.start();
    });
    $(document).on('pjax:success', function () {
        NProgress.done();
        $("a[href='"+location.pathname+"']").parent().addClass("active");
    });
    $(window).on('popstate.pjax', function (event) {
        $.pjax.reload('#js-repo-pjax-container', {timeout: 650});
    });
    // $.pjax.reload('#js-repo-pjax-container', {timeout: 650});
    if ($.support.pjax) {
        $(document).pjax('a[data-pjax]', '#js-repo-pjax-container')
    }
});