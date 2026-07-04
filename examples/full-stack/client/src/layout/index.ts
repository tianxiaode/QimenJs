/**
 * 管理模板布局组件
 *
 * 侧边栏 + 顶栏 + 内容区
 */

import { CSS } from '../styles/theme';

// i18n 已通过 public/i18n.js 预加载，从全局获取
const i18n = (window as any).orbitI18n?.i18n;

// 注入全局样式
let styleInjected = false;
export function injectStyles(): void {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    styleInjected = true;
}

// 页面导航项定义
export interface NavItem {
    id: string;
    label: string;
    icon: string;
    badge?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        title: '概览',
        items: [
            { id: 'dashboard', label: '仪表盘', icon: '◉' },
        ],
    },
    {
        title: '核心基础',
        items: [
            { id: 'error', label: '错误处理', icon: '⊘' },
            { id: 'logger', label: '日志系统', icon: '📋' },
            { id: 'utils', label: '工具函数', icon: '🔧' },
            { id: 'async', label: '异步工具', icon: '⏱' },
            { id: 'runtime', label: '运行时检测', icon: '🖥' },
            { id: 'crypto', label: '加密工具', icon: '🔐' },
            { id: 'types', label: '类型系统', icon: '📐' },
            { id: 'i18n', label: '国际化', icon: '🌐' },
        ],
    },
    {
        title: '基础设施',
        items: [
            { id: 'registry', label: '注册器', icon: '📑' },
            { id: 'cache', label: '缓存系统', icon: '💾' },
            { id: 'events', label: '事件总线', icon: '📡' },
            { id: 'task', label: '任务调度', icon: '⚙' },
            { id: 'composable', label: '组合能力', icon: '🧩' },
            { id: 'context', label: '上下文管理', icon: '📦' },
        ],
    },
    {
        title: '功能工具',
        items: [
            { id: 'schema', label: 'Schema', icon: '📝' },
            { id: 'validation', label: '表单验证', icon: '✓' },
            { id: 'pipeline', label: '管道处理', icon: '🔀' },
            { id: 'mime', label: 'MIME类型', icon: '📄' },
            { id: 'pattern', label: '模式匹配', icon: '🔍' },
            { id: 'event-dom', label: 'DOM事件', icon: '👆' },
        ],
    },
    {
        title: '高级功能',
        items: [
            { id: 'data-processor', label: '数据处理器', icon: '🔄' },
            { id: 'http', label: 'HTTP客户端', icon: '🌍' },
            { id: 'system-abilities', label: '系统能力', icon: '⚡' },
        ],
    },
    {
        title: '数据管理',
        items: [
            { id: 'abp-users', label: 'ABP用户', icon: '👤', badge: 'CRUD' },
            { id: 'abp-products', label: 'ABP产品', icon: '📦', badge: 'CRUD' },
            { id: 'spring-orders', label: 'Spring订单', icon: '🛒', badge: 'CRUD' },
            { id: 'spring-items', label: 'Spring商品', icon: '🏷', badge: '只读' },
            { id: 'departments', label: '部门树', icon: '🌳', badge: 'Tree' },
            { id: 'notifications', label: '本地通知', icon: '🔔', badge: '只读' },
            { id: 'tags', label: '本地标签', icon: '🏷', badge: 'CRUD' },
        ],
    },
];

// 当前活跃页面
let activePage = 'dashboard';
let pageChangeCallback: ((pageId: string) => void) | null = null;

export function setActivePage(pageId: string): void {
    activePage = pageId;
    // 更新侧边栏高亮
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-page') === pageId);
    });
    // 更新面包屑
    const breadcrumb = document.getElementById('breadcrumb-current');
    if (breadcrumb) {
        const item = navGroups.flatMap(g => g.items).find(i => i.id === pageId);
        breadcrumb.textContent = item?.label || pageId;
    }
    // 触发页面切换回调
    pageChangeCallback?.(pageId);
}

export function onPageChange(callback: (pageId: string) => void): void {
    pageChangeCallback = callback;
}

/**
 * 渲染管理模板布局
 */
export function renderLayout(authenticated: boolean): void {
    injectStyles();

    const navHtml = navGroups.map(group => `
        <div class="nav-group">
            <div class="nav-group-title">${group.title}</div>
            ${group.items.map(item => `
                <div class="nav-item ${item.id === activePage ? 'active' : ''}" data-page="${item.id}" onclick="window.__navigate('${item.id}')">
                    <span class="nav-icon">${item.icon}</span>
                    <span>${item.label}</span>
                    ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('');

    document.getElementById('app')!.innerHTML = `
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-brand">
                    <h1>OrbitJS</h1>
                    <span>Enterprise Entity Framework</span>
                </div>
                <nav class="sidebar-nav">
                    ${navHtml}
                </nav>
            </aside>
            <div class="main-content">
                <header class="topbar">
                    <div class="topbar-left">
                        <div class="topbar-breadcrumb">
                            OrbitJS / <span id="breadcrumb-current">仪表盘</span>
                        </div>
                    </div>
                    <div class="topbar-right">
                        <select id="topbar-lang" class="input" style="width:auto;padding:4px 8px;font-size:12px;margin-right:8px;" onchange="window.__changeLang(this.value)">
                            <option value="zh-CN" ${(i18n.locale || 'zh-CN') === 'zh-CN' ? 'selected' : ''}>中文简体</option>
                            <option value="en-US" ${i18n.locale === 'en-US' ? 'selected' : ''}>English</option>
                            <option value="ja-JP" ${i18n.locale === 'ja-JP' ? 'selected' : ''}>日本語</option>
                        </select>
                        <div class="topbar-status">
                            <span class="status-dot ${authenticated ? '' : 'offline'}"></span>
                            <span>${authenticated ? '已认证' : '未认证'}</span>
                        </div>
                        ${authenticated ? '<button class="btn btn-ghost btn-sm" onclick="window.__logout()">登出</button>' : ''}
                    </div>
                </header>
                <main class="page-content" id="page-content">
                    <div class="loading-skeleton" style="height:24px;width:200px;margin-bottom:16px;"></div>
                    <div class="loading-skeleton" style="height:16px;width:300px;margin-bottom:8px;"></div>
                    <div class="loading-skeleton" style="height:16px;width:250px;"></div>
                </main>
            </div>
        </div>
    `;
}

/**
 * 渲染页面内容到主内容区
 */
export function renderPageContent(html: string): void {
    const content = document.getElementById('page-content');
    if (content) {
        content.innerHTML = html;
    }
}

// 暴露导航到 window
(window as any).__navigate = (pageId: string) => {
    setActivePage(pageId);
};

// 暴露语言切换到 window
(window as any).__changeLang = async (locale: string) => {
    await i18n.loadScript(`/locales/${locale}.js`);
    i18n.locale = locale;
};
