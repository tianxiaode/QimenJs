/**
 * 国际化页 - @orbitjs/i18n
 */
import { i18n } from '@orbitjs/i18n';
import { renderPageContent } from '../layout';

// 已加载的语言包
const loadedLocales = new Set<string>();

async function ensureLocale(locale: string): Promise<void> {
    if (loadedLocales.has(locale)) return;
    await i18n.loadScript(`/locales/${locale}.js`);
    loadedLocales.add(locale);
}

export async function renderI18n(): Promise<void> {
    // 确保当前语言包已加载
    await ensureLocale(i18n.locale || 'zh-CN');

    renderPageContent(`
        <div class="page-header">
            <h2>国际化</h2>
            <p>@orbitjs/i18n — 多语言切换 + 插值变量 + loadScript 动态加载</p>
        </div>

        <div class="section">
            <div class="section-title">语言切换（loadScript 动态加载）</div>
            <div class="card">
                <p class="text-sm text-muted mb-3">语言包为 public/locales/ 下的 .js 文件，通过 i18n.loadScript() 按需加载</p>
                <div class="flex gap-2 mb-3">
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('zh-CN')">中文简体</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('en-US')">English</button>
                    <button class="btn btn-ghost btn-sm" onclick="window.__switchLocale('ja-JP')">日本語</button>
                </div>
                <div id="i18n-demo"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">loadScript 加载日志</div>
            <div class="card">
                <div id="i18n-load-log" style="font-family:monospace;font-size:12px;background:#050506;padding:12px;border-radius:6px;max-height:150px;overflow-y:auto;">
                    <div style="color:#888;">等待操作...</div>
                </div>
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

function addLoadLog(msg: string): void {
    const el = document.getElementById('i18n-load-log');
    if (!el) return;
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    el.innerHTML += `<div style="padding:2px 0;"><span style="color:#666;">${time}</span> <span style="color:#4CAF50;">${msg}</span></div>`;
    el.scrollTop = el.scrollHeight;
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

(window as any).__switchLocale = async (locale: string) => {
    addLoadLog(`切换语言 → ${locale}`);
    await ensureLocale(locale);
    i18n.locale = locale;
    addLoadLog(`已切换到 ${locale}，消息数: ${Object.keys(i18n.getMessages() || {}).length}`);
    renderDemo();
};
