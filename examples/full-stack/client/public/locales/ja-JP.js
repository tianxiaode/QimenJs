/**
 * OrbitJS Demo - 日本語言語パック
 * i18n.loadScript() で動的にロード
 */
if (typeof window !== 'undefined' && window.__orbit_i18n_register__) {
    window.__orbit_i18n_register__('ja-JP', {
        'app.title': 'OrbitJS 管理テンプレート',
        'app.greeting': 'こんにちは、{name}！',
        'app.items': '{count} 件',
        'app.today': '今日は {date} です',
        'nav.dashboard': 'ダッシュボード',
        'nav.users': 'ユーザー管理',
        'btn.save': '保存',
        'btn.cancel': 'キャンセル',
        'btn.delete': '削除',
        'btn.search': '検索',
        'btn.reset': 'リセット',
        'btn.login': 'パスワードログイン',
        'btn.logout': 'ログアウト',
        'status.online': 'オンライン',
        'status.offline': 'オフライン',
        'status.authenticated': '認証済み',
        'status.unauthenticated': '未認証',
        'login.title': 'OrbitJS',
        'login.subtitle': 'Enterprise Entity Framework',
        'login.username': 'ユーザー名',
        'login.password': 'パスワード',
        'login.other': 'その他の方法',
        'login.authorize': '認可コード',
        'login.client': 'クライアント資格情報',
        'login.hint': 'テストアカウント：admin / 123456',
        'topbar.breadcrumb': 'OrbitJS',
        'lang.zh-CN': '中文简体',
        'lang.en-US': 'English',
        'lang.ja-JP': '日本語',
    });
}
