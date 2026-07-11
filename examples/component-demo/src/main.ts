/**
 * QimenJS 组件演示 — 入口
 *
 * 测试内容：
 * 1. ComponentBase 模板模式加载 home 页面
 * 2. 主题切换（light/dark/中国色）
 * 3. 图标库（查看全部图标）
 * 4. 路由切换页面
 */

// ─── 注册组件 ───
import { registerAllComponents } from '@qimenjs/component';
registerAllComponents();

// ─── 注册模板 ───
import '@qimenjs/template';

// ─── 注册主题 ───
import { registerPresetThemes, registerChineseThemes, ThemeRegistrar } from '@qimenjs/theme';
registerPresetThemes();
registerChineseThemes();

// ─── 引入图标 CSS ───
import '@qimenjs/icon/q-icon.css';

// ─── 引入路由 ───
import { Router } from '@qimenjs/router';

// ─── 引入组件系统 ───
import { ComponentBase } from '@qimenjs/component-core';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { RouteAbility } from '@qimenjs/router';
import { TemplateRegistrar } from '@qimenjs/template';
import { RegistryHub } from '@qimenjs/registry';
import type { LayoutNode } from '@qimenjs/layout';

// ─── 注册页面模板到 TemplateRegistrar ───
const templateRegistrar = RegistryHub.get<TemplateRegistrar>('template');

// Home 页面 LayoutNode
const HomeLayout: LayoutNode = {
    type: 'VBox',
    id: 'home-page',
    className: 'home-page',
    children: [
        {
            type: 'HBox',
            className: 'home-header',
            children: [
                { type: 'Text', props: { text: 'QimenJS' }, className: 'home-title' },
                { type: 'Text', props: { text: '组件演示' }, className: 'home-subtitle' },
            ],
        },
        {
            type: 'Text',
            props: { text: '欢迎使用 QimenJS 组件系统！这是一个使用 ComponentBase 模板模式渲染的页面。' },
            className: 'home-desc',
        },
        {
            type: 'HBox',
            className: 'home-actions',
            children: [
                { type: 'Button', props: { text: '查看图标', icon: 'q-icon-dragon' }, className: 'home-btn' },
                { type: 'Button', props: { text: '切换主题', icon: 'q-icon-yin-yang' }, className: 'home-btn' },
            ],
        },
    ],
};

// 图标展示页 LayoutNode
const IconsLayout: LayoutNode = {
    type: 'VBox',
    id: 'icons-page',
    className: 'icons-page',
    children: [
        {
            type: 'Text',
            props: { text: '图标库 — 全部图标' },
            className: 'page-title',
        },
    ],
};

// 主题展示页 LayoutNode
const ThemeLayout: LayoutNode = {
    type: 'VBox',
    id: 'theme-page',
    className: 'theme-page',
    children: [
        {
            type: 'Text',
            props: { text: '主题系统' },
            className: 'page-title',
        },
    ],
};

templateRegistrar!.registerJson('HomePage', HomeLayout);
templateRegistrar!.registerJson('IconsPage', IconsLayout);
templateRegistrar!.registerJson('ThemePage', ThemeLayout);

// ─── 启动应用 ───

function bootstrap(): void {
    // 应用主题
    ThemeRegistrar.getInstance().apply('light');

    // 创建应用容器
    const AppContainer = ComponentBase.with(RouteAbility, ChildrenAbility);
    const app = new AppContainer();
    app.type = 'VBox';
    app.initElement();
    app.el.classList.add('app-root');
    document.getElementById('app')!.appendChild(app.el);

    // 设置路由
    app.setupRoute({
        routes: {
            '/': 'HomePage',
            '/icons': 'IconsPage',
            '/theme': 'ThemePage',
        },
        defaultPath: '/',
        hashMode: true,
        onRouteChange: (event: any) => {
            console.log('[Route]', event.previousPath, '->', event.path, event.params);

            // 默认自动切换
            if (event.config) {
                app.removeAll();
                if (typeof event.config === 'object' && event.config.type) {
                    app.add(event.config);
                }
            }

            // 图标页需要额外渲染图标网格
            if (event.path === '/icons') {
                renderIconGrid(app);
            }

            // 主题页需要额外渲染主题选择
            if (event.path === '/theme') {
                renderThemePage(app);
            }

            // 更新导航高亮
            updateNavHighlight(event.path);
        },
    });

    // 渲染侧边导航
    renderSidebar();
}

/**
 * 渲染侧边导航
 */
function renderSidebar(): void {
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    nav.innerHTML = `
        <div class="nav-brand">QimenJS Demo</div>
        <a href="#/" class="nav-item active" data-path="/">
            <i class="q-icon-home"></i> 首页
        </a>
        <a href="#/icons" class="nav-item" data-path="/icons">
            <i class="q-icon-dragon"></i> 图标库
        </a>
        <a href="#/theme" class="nav-item" data-path="/theme">
            <i class="q-icon-yin-yang"></i> 主题
        </a>
    `;
    document.getElementById('app')!.prepend(nav);
}

/**
 * 更新导航高亮
 */
function updateNavHighlight(path: string): void {
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-path') === path);
    });
}

/**
 * 渲染图标网格
 */
function renderIconGrid(app: any): void {
    const iconNames = [
        'save', 'refresh', 'edit', 'delete', 'add', 'copy', 'paste', 'cut',
        'undo', 'redo', 'close', 'check', 'print', 'lock', 'unlock', 'export',
        'back', 'forward', 'up', 'down', 'left', 'right', 'upload', 'download',
        'search', 'filter', 'settings', 'menu', 'more', 'home', 'dashboard', 'notification',
        'success', 'warning', 'error', 'info', 'question', 'star', 'heart', 'flag',
        'tag', 'bell', 'file', 'folder', 'calendar', 'clock', 'mail', 'chat',
        'chart-bar', 'table', 'shopping', 'cart', 'wallet', 'coin', 'order',
        'dragon', 'phoenix', 'lantern', 'teapot', 'bamboo', 'plum', 'seal', 'scroll',
        'abacus', 'brush', 'ink', 'fan', 'temple', 'greatwall', 'china', 'yin-yang',
    ];

    const container = app.el.querySelector('.icons-page') || app.el;
    const grid = document.createElement('div');
    grid.className = 'icon-grid';
    grid.innerHTML = iconNames.map(name =>
        `<div class="icon-item" title="q-icon-${name}">
            <i class="q-icon-${name}"></i>
            <span class="icon-name">${name}</span>
        </div>`
    ).join('');
    container.appendChild(grid);
}

/**
 * 渲染主题选择页
 */
function renderThemePage(app: any): void {
    const container = app.el.querySelector('.theme-page') || app.el;
    const themes = [
        { name: 'light', label: '亮色' },
        { name: 'dark', label: '暗色' },
        { name: 'celadon', label: '青瓷' },
        { name: 'cinnabar', label: '朱砂' },
        { name: 'indigo', label: '靛蓝' },
        { name: 'yellow', label: '鹅黄' },
        { name: 'rosewood', label: '紫檀' },
        { name: 'ink', label: '墨色' },
        { name: 'dai', label: '黛色' },
    ];

    const grid = document.createElement('div');
    grid.className = 'theme-grid';
    grid.innerHTML = themes.map(t =>
        `<button class="theme-card" onclick="window.__switchTheme('${t.name}')">
            <div class="theme-preview" data-theme="${t.name}"></div>
            <span class="theme-label">${t.label}</span>
        </button>`
    ).join('');
    container.appendChild(grid);
}

// 暴露主题切换到 window
(window as any).__switchTheme = (name: string) => {
    ThemeRegistrar.getInstance().apply(name);
    console.log('[Theme] switched to', name);
};

// ─── 注入演示样式 ───
const style = document.createElement('style');
style.textContent = `
    /* Layout */
    .app-root { display: flex; min-height: 100vh; margin-left: 200px; padding: 24px; flex: 1; }
    .sidebar-nav {
        width: 200px; min-width: 200px; background: #1a1a2e; color: #e0e0e0;
        display: flex; flex-direction: column; padding: 16px 0;
        position: fixed; top: 0; left: 0; bottom: 0; z-index: 100;
    }
    .nav-brand { padding: 12px 20px; font-size: 18px; font-weight: bold; color: #6366f1; }
    .nav-item {
        display: flex; align-items: center; gap: 8px; padding: 10px 20px;
        color: #a0a0b0; text-decoration: none; cursor: pointer; transition: all 0.2s;
    }
    .nav-item:hover { background: rgba(99,102,241,0.1); color: #e0e0e0; }
    .nav-item.active { background: rgba(99,102,241,0.15); color: #6366f1; border-right: 3px solid #6366f1; }

    /* Home */
    .home-page { gap: 16px; padding: 24px; }
    .home-header { gap: 12px; align-items: baseline; }
    .home-title { font-size: 28px; font-weight: bold; }
    .home-subtitle { font-size: 16px; color: #888; }
    .home-desc { color: #666; line-height: 1.6; }
    .home-actions { gap: 12px; margin-top: 8px; }
    .home-btn { cursor: pointer; }

    /* Icons */
    .icons-page { gap: 16px; padding: 24px; }
    .page-title { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
    .icon-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 12px; padding: 8px 0;
    }
    .icon-item {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
        padding: 12px 4px; border-radius: 8px; cursor: pointer;
        transition: all 0.2s; background: #fff; border: 1px solid #eee;
    }
    .icon-item:hover { background: #f0f0ff; border-color: #6366f1; transform: translateY(-2px); }
    .icon-item i { font-size: 24px; color: #333; }
    .icon-name { font-size: 11px; color: #888; text-align: center; word-break: break-all; }

    /* Theme */
    .theme-page { gap: 16px; padding: 24px; }
    .theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; }
    .theme-card {
        display: flex; flex-direction: column; align-items: center; gap: 8px;
        padding: 16px; border-radius: 8px; cursor: pointer; border: 2px solid #eee;
        background: #fff; transition: all 0.2s;
    }
    .theme-card:hover { border-color: #6366f1; transform: translateY(-2px); }
    .theme-preview { width: 48px; height: 48px; border-radius: 50%; }
    .theme-label { font-size: 13px; color: #555; }
`;
document.head.appendChild(style);

// 启动
bootstrap();
