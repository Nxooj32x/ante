seajs.config({
    // 别名配置
    alias: {},

    // 路径配置
    paths: {
        'common': '${sure_static_url}js/editor/common',
        'editor': '${sure_static_url}js/editor',
        'view' : '${sure_static_url}js/editor/view'
    }

});
// 加载入口模块
seajs.use('editor/app');