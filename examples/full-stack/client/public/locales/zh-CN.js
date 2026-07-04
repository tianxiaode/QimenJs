/**
 * QimenJS Demo - 中文简体语言包
 * 通过 i18n.loadScript() 动态加载
 */
if (typeof window !== 'undefined' && window.__qimen_i18n_register__) {
    window.__qimen_i18n_register__('zh-CN', {
        app: {
            title: 'QimenJS 管理模板',
            greeting: '你好，{name}！',
            items: '{count} 个项目',
            today: '今天是 {date}',
        },
        nav: {
            dashboard: '仪表盘',
            users: '用户管理',
        },
        btn: {
            save: '保存',
            cancel: '取消',
            delete: '删除',
            search: '搜索',
            reset: '重置',
            login: '密码模式登录',
            logout: '登出',
        },
        status: {
            online: '在线',
            offline: '离线',
            authenticated: '已认证',
            unauthenticated: '未认证',
        },
        login: {
            title: 'QimenJS',
            subtitle: 'Enterprise Entity Framework',
            username: '用户名',
            password: '密码',
            other: '其他方式',
            authorize: '授权码模式',
            client: '客户端凭证',
            hint: '测试账号：admin / 123456',
        },
        topbar: {
            breadcrumb: 'QimenJS',
        },
        lang: {
            'zh-CN': '中文简体',
            'en-US': 'English',
            'ja-JP': '日本語',
        },
    });
}
