/**
 * QimenJS 组件演示 — 入口
 *
 * 架构：
 * 1. AppShell = TemplateComponent.withTemplate
 *    - 顶栏分左右两部分：
 *      - 左边：品牌区（Logo+文字），宽度与侧边栏同步
 *      - 右边：功能区，折叠按钮在最左边，主题下拉在最右边
 *    - 左侧侧边栏：RouteNavComponent
 *    - 右侧 RouteContainerComponent（路由容器）
 * 2. 导航使用 Font Awesome 免费图标
 * 3. 品牌区桥接折叠事件，与导航对齐（icon-only 或带文本）
 * 4. 折叠按钮在功能区最左边
 * 5. 顶栏右边主题下拉按钮，测试 MenuComponent 下拉功能
 */

// ─── 注册主题 ───
import { registerPresetThemes, registerChineseThemes, ThemeRegistrar } from '@qimenjs/theme';
import { Logger } from '@qimenjs/logger';

// 开启 debug 日志
Logger.root = new Logger({ level: 'debug' });

registerPresetThemes();
registerChineseThemes();

// ─── 引入样式 ───
import './styles.css';
import {
    navCSS, menuCSS, buttonCSS,
    RouteNavComponent, RouteContainerComponent,
    ButtonComponent, MenuComponent,
} from '@qimenjs/component';
import { registerAllComponents } from '@qimenjs/component';

// 注入组件 CSS
const navStyleEl = document.createElement('style');
navStyleEl.textContent = navCSS;
document.head.appendChild(navStyleEl);

const menuStyleEl = document.createElement('style');
menuStyleEl.textContent = menuCSS;
document.head.appendChild(menuStyleEl);

const buttonStyleEl = document.createElement('style');
buttonStyleEl.textContent = buttonCSS;
document.head.appendChild(buttonStyleEl);

// 注册组件类型
registerAllComponents();

// ─── 组件系统 ───
import { TemplateComponent } from '@qimenjs/component-core';
import { Router } from '@qimenjs/router';
import { EventBridge } from '@qimenjs/events';

// ─── 页面组件 ───
import { HomePage } from './pages/home';
import { ThemePage } from './pages/theme';
import { ComponentsPage } from './pages/components';

// ─── Logo SVG ───
import LOGO_SVG from './logo.svg?raw';

// ─── 主题列表 ───
const THEME_LIST = [
    { key: 'light',    label: '浅色' },
    { key: 'dark',     label: '暗色' },
    { key: 'celadon',  label: '青瓷' },
    { key: 'cinnabar', label: '朱砂' },
    { key: 'indigo',   label: '靛蓝' },
    { key: 'yellow',   label: '明黄' },
    { key: 'rosewood', label: '紫檀' },
    { key: 'ink',      label: '水墨' },
    { key: 'dai',      label: '黛色' },
];

// ─── AppShell ───

class AppShell extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'app-root',
        layout: 'vbox',
        children: [
            // 顶栏 — 水平布局，垂直居中
            { tag: 'div', className: 'app-topbar', layout: 'hbox', align: 'center', children: [
                // 左边：品牌区（宽度与侧边栏同步）— 水平布局，垂直居中
                { tag: 'div', name: 'shell:topbarBrand', className: 'topbar-brand', layout: 'hbox', align: 'center', gap: 10, children: [
                    { tag: 'span', className: 'topbar-brand-logo', text: LOGO_SVG },
                    { tag: 'span', name: 'shell:brandText', content: 'brandText', className: 'topbar-brand-text' },
                ]},
                // 右边：功能区 — 水平布局，垂直居中，间距4px
                { tag: 'div', className: 'topbar-main', layout: 'hbox', align: 'center', gap: 4, children: [
                    // 折叠按钮 — 通过 content 配置子节点
                    { name: 'shell:toggleBtn', type: ButtonComponent, className: 'q-button--ghost', props: { content: { icon: { className: 'fa-solid fa-bars' } } }, events: { click: { handler: 'onToggleNavClick' } } },
                    // dark 模式切换按钮
                    { name: 'shell:darkBtn', type: ButtonComponent, className: 'q-button--ghost', props: { content: { icon: { className: 'fa-solid fa-moon' } } }, events: { click: { handler: 'onDarkToggleClick' } } },
                    // 弹性空间
                    { tag: 'div', className: 'topbar-spacer' },
                    // 主题下拉按钮
                    { name: 'shell:themeBtn', type: ButtonComponent, className: 'q-button--ghost', props: { content: { icon: { className: 'fa-solid fa-palette' }, text: { innerHTML: '浅色' } } }, events: { click: { handler: 'onThemeBtnClick' } } },
                ]},
            ]},
            // 主体 — 水平布局
            { tag: 'div', className: 'app-body', layout: 'hbox', children: [
                // 侧边栏
                { tag: 'div', name: 'shell:sidebar', className: 'app-sidebar', layout: 'vbox', children: [
                    { tag: 'div', name: 'shell:nav', type: RouteNavComponent, className: 'sidebar-nav' },
                ]},
                // 内容区
                { tag: 'div', className: 'app-content', layout: 'fit', children: [
                    { name: 'shell:page', type: RouteContainerComponent },
                ]},
            ]},
        ],
    },
    body: {
        type: 'AppShell',

        brandText: 'QimenJS',

        /** 当前导航模式 */
        _navCollapsed: false,

        /** 当前主题 key */
        _currentTheme: 'light',

        /** 是否 dark 模式 */
        _isDark: false,

        /** 主题菜单实例 */
        _themeMenu: null as MenuComponent | null,

        /**
         * 折叠按钮点击 — 由模板 events 自动绑定
         */
        onToggleNavClick(): void {
            this._navCollapsed = !this._navCollapsed;
            this._applyNavMode();
        },

        /**
         * dark 模式切换 — 由模板 events 自动绑定
         */
        onDarkToggleClick(): void {
            this._isDark = !this._isDark;
            const themeKey = this._isDark ? 'dark' : 'light';
            this._currentTheme = themeKey;
            ThemeRegistrar.getInstance().apply(themeKey);

            // 更新 dark 按钮图标
            const darkBtn = this.nodeMap?.['shell']?.['darkBtn']?.component;
            if (darkBtn) {
                darkBtn.icon = this._isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }
        },

        /**
         * 主题按钮点击 — 由模板 events 自动绑定
         */
        onThemeBtnClick(e: any): void {
            this._toggleThemeMenu(e);
        },

        /**
         * 应用导航折叠模式
         */
        _applyNavMode(): void {
            const mode = this._navCollapsed ? 'collapsed' : 'expanded';

            // 通过 nodeMap 更新侧边栏样式
            const sidebar = this.nodeMap?.['shell']?.['sidebar']?.el;
            if (sidebar) {
                sidebar.classList.toggle('app-sidebar--collapsed', this._navCollapsed);
            }

            // 同步品牌区
            this._syncBrandArea(mode);

            // 通过桥接事件通知导航组件
            EventBridge.getInstance().emit('nav:mode', { mode });

            // 通过 nodeMap 直接调用导航组件的 setMode
            const navNode = this.nodeMap?.['shell']?.['nav'];
            if (navNode?.component && typeof navNode.component.setMode === 'function') {
                navNode.component.setMode(mode);
            }
        },

        /**
         * 同步品牌区与导航状态
         * 折叠时只显示 Logo，展开时显示 Logo+文字
         */
        _syncBrandArea(mode: string): void {
            const collapsed = mode === 'collapsed';

            // 品牌区文字联动
            const brandText = this.nodeMap?.['shell']?.['brandText']?.el;
            if (brandText) {
                brandText.style.display = collapsed ? 'none' : '';
            }

            // 品牌区宽度与侧边栏同步
            const topbarBrand = this.nodeMap?.['shell']?.['topbarBrand']?.el;
            if (topbarBrand) {
                topbarBrand.classList.toggle('topbar-brand--collapsed', collapsed);
            }
        },

        /**
         * 切换主题下拉菜单
         */
        _toggleThemeMenu(e: any): void {
            if (this._themeMenu && this._themeMenu.isOpen) {
                this._themeMenu.close();
                return;
            }

            const anchor = e.el || (e as any)?.currentTarget;

            // 创建主题菜单
            const items = THEME_LIST.map(t => ({
                text: t.label,
                icon: t.key === this._currentTheme ? '<span style="color:var(--q-colors-primary,#0078d4)">●</span>' : '',
                onSelect: () => {
                    this._applyTheme(t.key, t.label);
                    if (this._themeMenu) {
                        this._themeMenu.close();
                    }
                },
            }));

            this._themeMenu = new MenuComponent({
                anchor,
                placement: 'bottom',
                offset: 4,
                items,
            });

            this._themeMenu.open();
        },

        /**
         * 应用主题
         */
        _applyTheme(themeKey: string, themeLabel: string): void {
            this._currentTheme = themeKey;
            this._isDark = themeKey === 'dark';

            // 通过 nodeMap 更新主题按钮文字
            const themeBtn = this.nodeMap?.['shell']?.['themeBtn']?.component;
            if (themeBtn) {
                themeBtn.text = themeLabel;
            }

            // 更新 dark 按钮图标
            const darkBtn = this.nodeMap?.['shell']?.['darkBtn']?.component;
            if (darkBtn) {
                darkBtn.icon = this._isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }

            // 切换主题
            ThemeRegistrar.getInstance().apply(themeKey);
        },
    },
}) {
    static children = {
        nav: {
            eventKey: 'nav',
            direction: 'vertical',
            gap: '0',
            pathIndex: { '/': 0, '/components': 1, '/theme': 2 },
            indexPath: ['/', '/components', '/theme'],
            items: [
                { text: '首页', icon: '<i class="fa-solid fa-house"></i>', active: true },
                { text: '组件', icon: '<i class="fa-solid fa-cubes"></i>' },
                { text: '主题', icon: '<i class="fa-solid fa-palette"></i>' },
            ],
            activeIndex: 0,
        },
        page: {
            routeMap: { '/': HomePage, '/components': ComponentsPage, '/theme': ThemePage },
            defaultComponent: HomePage,
        },
    };
}

// ─── 启动应用 ───

function bootstrap(): void {
    // 应用默认主题
    ThemeRegistrar.getInstance().apply('light');

    // 暴露主题切换到 window
    (window as any).__switchTheme = (name: string) => {
        ThemeRegistrar.getInstance().apply(name);
        console.log('[Theme] switched to', name);
    };

    // 初始化路由
    const router = Router.getInstance();
    router.register({ '/': 'home', '/components': 'components', '/theme': 'theme' });
    router.start(true); // hashMode = true

    // 创建 AppShell 实例
    const app = new AppShell();
    document.getElementById('app')!.appendChild(app.el);
}

bootstrap();
