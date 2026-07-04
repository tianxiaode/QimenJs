/**
 * QimenJS Demo - English language pack
 * Loaded dynamically via i18n.loadScript()
 */
if (typeof window !== 'undefined' && window.__qimen_i18n_register__) {
    window.__qimen_i18n_register__('en-US', {
        app: {
            title: 'QimenJS Admin Template',
            greeting: 'Hello, {name}!',
            items: '{count} items',
            today: 'Today is {date}',
        },
        nav: {
            dashboard: 'Dashboard',
            users: 'User Management',
        },
        btn: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            search: 'Search',
            reset: 'Reset',
            login: 'Password Login',
            logout: 'Logout',
        },
        status: {
            online: 'Online',
            offline: 'Offline',
            authenticated: 'Authenticated',
            unauthenticated: 'Unauthenticated',
        },
        login: {
            title: 'QimenJS',
            subtitle: 'Enterprise Entity Framework',
            username: 'Username',
            password: 'Password',
            other: 'Other Methods',
            authorize: 'Authorization Code',
            client: 'Client Credentials',
            hint: 'Test account: admin / 123456',
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
