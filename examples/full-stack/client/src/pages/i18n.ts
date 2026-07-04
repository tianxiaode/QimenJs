/**
 * 国际化页 - @orbitjs/i18n
 */
import { I18nManager } from '@orbitjs/i18n';
import { renderPageContent } from '../layout';

const i18n = I18nManager.getInstance();

// 注册语言包
i18n.register('zh-CN', {
    'app.title': 'OrbitJS 管理模板',
    'app.greeting': '你好，{name}！',
    'app.items': '{count} 个项目',
    'app.today': '今天是 {date}',
    'nav.dashboard': '仪表盘',
    'nav.users': '用户管理',
    'btn.save': '保存',
    'btn.cancel': '取消',
    'btn.delete': '删除',
    'status.online': '在线',
    'status.offline': '离线',
});

i18n.register('en-US', {
    'app.title': 'OrbitJS Admin Template',
    'app.greeting': 'Hello, {name}!',
    'app.items': '{count} items',
    'app.today': 'Today is {date}',
    'nav.dashboard': 'Dashboard',
    'nav.users': 'User Management',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.delete': 'Delete',
    'status.online': 'Online',
    'status.offline': 'Offline',
});

i18n.register('ja-JP', {
    'app.title': 'OrbitJS 管理テンプレート',
    'app.greeting': 'こんにちは、{name}！',
    'app.items': '{count} 件',
    'app.today': '今日は {date} です',
    'nav.dashboard': 'ダッシュボード',
    'nav.users': 'ユーザー管理',
    'btn.save': '保存',
    'btn.cancel': 'キャンセル',
    'btn.delete': '削除',
    'status.online': 'オンライン',
    'status.offline': 'オフライン',
});

let currentLocale = 'zh-CN';
i18n.setLocale(currentLocale);

export function renderI18n(): void {
    renderPageContent(`
        <div class="page-header">
            <h2>国际化</h2>
            <p>@orbitjs/i18n — 多语言切换 + 插值变量 + 动态加载</p>
        </div>

        <div class="section">
            <div class="section-title">语言切换</div>
            <div class="card">
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('zh-CN')">中文简体</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('en-US')">English</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('ja-JP')">日本語</button>
                </div>
                <div id="i18n-demo"></div>
            </div>
        </div>
    `);

    renderDemo();
}

function renderDemo(): void {
    const el = document.getElementById('i18n-demo');
    if (!el) return;

    const keys = ['app.title', 'app.greeting', 'app.items', 'app.today', 'nav.dashboard', 'nav.users', 'btn.save', 'btn.cancel', 'btn.delete', 'status.online', 'status.offline'];

    el.innerHTML = `
        <div class="text-sm mb-2" style="color:#8A8F98;">当前语言：<span class="badge badge-info">${currentLocale}</span></div>
        <table class="data-table">
            <thead><tr><th>Key</th><th>翻译结果</th></tr></thead>
            <tbody>${keys.map(key => {
                let value = i18n.t(key, { name: 'OrbitJS', count: 42, date: new Date().toLocaleDateString() });
                return `<tr><td class="text-muted">${key}</td><td>${value}</td></tr>`;
            }).join('')}</tbody>
        </table>
    `;
}

(window as any).__switchLocale = (locale: string) => {
    currentLocale = locale;
    i18n.setLocale(locale);
    renderDemo();
};
