/**
 * 国际化页 - @orbitjs/i18n
 */
import { i18n, registerMessages } from '@orbitjs/i18n';
import { renderPageContent } from '../layout';

// 注册语言包
registerMessages('zh-CN', {
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

registerMessages('en-US', {
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

registerMessages('ja-JP', {
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

let currentLocale = i18n.locale || 'zh-CN';

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

        <div class="section">
            <div class="section-title">API 一览</div>
            <div class="card">
                <table class="data-table">
                    <thead><tr><th>方法</th><th>说明</th></tr></thead>
                    <tbody>
                        <tr><td><code>i18n.t(key, params?, default?)</code></td><td>翻译文本，支持 {key} 插值</td></tr>
                        <tr><td><code>i18n.locale</code></td><td>获取/设置当前语言（setter 触发 locale:change 事件）</td></tr>
                        <tr><td><code>i18n.inject(messages, locale?)</code></td><td>注入/合并消息到指定语言</td></tr>
                        <tr><td><code>registerMessages(locale, messages)</code></td><td>注册语言包（自动切换 locale）</td></tr>
                        <tr><td><code>i18n.loadScript(url)</code></td><td>动态加载 .js 语言包文件</td></tr>
                        <tr><td><code>i18n.onLocaleChange(handler)</code></td><td>监听语言变更，返回取消函数</td></tr>
                        <tr><td><code>i18n.getMessage(path)</code></td><td>获取原始翻译值（不做插值）</td></tr>
                        <tr><td><code>i18n.getMessages()</code></td><td>获取当前语言全部消息</td></tr>
                    </tbody>
                </table>
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
        <div class="text-sm mb-2" style="color:#8A8F98;">当前语言：<span class="badge badge-info">${i18n.locale}</span></div>
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
    i18n.locale = locale;
    currentLocale = locale;
    renderDemo();
};
