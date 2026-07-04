/**
 * OrbitJS Demo - 中文简体语言包
 * 通过 i18n.loadScript() 动态加载
 */
if (typeof window !== 'undefined' && window.__orbit_i18n_register__) {
    window.__orbit_i18n_register__('zh-CN', {
        'app.title': 'OrbitJS 管理模板',
        'app.greeting': '你好，{name}！',
        'app.items': '{count} 个项目',
        'app.today': '今天是 {date}',
        'nav.dashboard': '仪表盘',
        'nav.users': '用户管理',
        'btn.save': '保存',
        'btn.cancel': '取消',
        'btn.delete': '删除',
        'btn.search': '搜索',
        'btn.reset': '重置',
        'btn.login': '密码模式登录',
        'btn.logout': '登出',
        'status.online': '在线',
        'status.offline': '离线',
        'status.authenticated': '已认证',
        'status.unauthenticated': '未认证',
        'login.title': 'OrbitJS',
        'login.subtitle': 'Enterprise Entity Framework',
        'login.username': '用户名',
        'login.password': '密码',
        'login.other': '其他方式',
        'login.authorize': '授权码模式',
        'login.client': '客户端凭证',
        'login.hint': '测试账号：admin / 123456',
        'topbar.breadcrumb': 'OrbitJS',
        'lang.zh-CN': '中文简体',
        'lang.en-US': 'English',
        'lang.ja-JP': '日本語',
    });
}
