/**
 * OrbitJS Demo - 日本語言語パック
 * i18n.loadScript() で動的にロード
 */
if (typeof window !== 'undefined' && window.__orbit_i18n_register__) {
    window.__orbit_i18n_register__('ja-JP', {
        app: {
            title: 'OrbitJS 管理テンプレート',
            greeting: 'こんにちは、{name}！',
            items: '{count} 件',
            today: '今日は {date} です',
        },
        nav: {
            dashboard: 'ダッシュボード',
            users: 'ユーザー管理',
        },
        btn: {
            save: '保存',
            cancel: 'キャンセル',
            delete: '削除',
            search: '検索',
            reset: 'リセット',
            login: 'パスワードログイン',
            logout: 'ログアウト',
        },
        status: {
            online: 'オンライン',
            offline: 'オフライン',
            authenticated: '認証済み',
            unauthenticated: '未認証',
        },
        login: {
            title: 'OrbitJS',
            subtitle: 'Enterprise Entity Framework',
            username: 'ユーザー名',
            password: 'パスワード',
            other: 'その他の方法',
            authorize: '認可コード',
            client: 'クライアント資格情報',
            hint: 'テストアカウント：admin / 123456',
        },
        topbar: {
            breadcrumb: 'OrbitJS',
        },
        lang: {
            'zh-CN': '中文简体',
            'en-US': 'English',
            'ja-JP': '日本語',
        },
    });
}
