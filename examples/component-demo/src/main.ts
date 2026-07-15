/**
 * QimenJS 组件演示 — 入口
 *
 * 架构：
 * 1. AppShell = TemplateComponent.withTemplate（新版 ComponentTemplate 格式）
 *    - 模板：左侧 RouteNavComponent（路由导航），右侧 RouteContainerComponent（路由容器）
 *    - 路由导航自动处理：点击 → 切换路由，路由变化 → 切换高亮 + 发事件
 *    - 路由容器自动处理：监听 route:change → 替换内容区域
 * 2. HomePage / IconsPage / ThemePage 各自用 withTemplate 定义
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
import { navCSS, RouteNavComponent, RouteContainerComponent } from '@qimenjs/component';
import { registerAllComponents } from '@qimenjs/component';

// 注入 nav CSS
const styleEl = document.createElement('style');
styleEl.textContent = navCSS;
document.head.appendChild(styleEl);

// 注册组件类型
registerAllComponents();

// ─── 组件系统 ───
import { TemplateComponent } from '@qimenjs/component-core';
import { Router } from '@qimenjs/router';

// ─── 页面组件 ───
import { HomePage } from './pages/home';
import { IconsPage } from './pages/icons';
import { ThemePage } from './pages/theme';
import { IconComparePage } from './pages/icon-compare';

// ─── AppShell：声明式应用壳，基本不用写逻辑 ───

class AppShell extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'app-root',
        children: [
            { tag: 'div', className: 'app-sidebar', children: [
                { tag: 'div', name: 'shell:nav', type: RouteNavComponent, className: 'sidebar-nav' },
            ]},
            { tag: 'div', className: 'app-content', children: [
                { name: 'shell:page', type: RouteContainerComponent },
            ]},
        ],
    },
    body: {
        type: 'AppShell',
    },
}) {
    static children = {
        nav: {
            eventKey: 'abc',
            direction: 'vertical',
            gap: '0',
            pathIndex: { '/': 0, '/icons': 1, '/theme': 2, '/compare': 3 },
            indexPath: ['/', '/icons', '/theme', '/compare'],
            items: [
                { text: '首页', icon: '<i class="q-icon-home"></i>', active: true },
                { text: '图标库', icon: '<i class="q-icon-dragon"></i>' },
                { text: '主题', icon: '<i class="q-icon-yin-yang"></i>' },
                { text: 'SVG vs 字体', icon: '<i class="q-icon-search"></i>' },
            ],
            activeIndex: 0,
        },
        page: {
            routeMap: { '/': HomePage, '/icons': IconsPage, '/theme': ThemePage, '/compare': IconComparePage },
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
    router.register({ '/': 'home', '/icons': 'icons', '/theme': 'theme', '/compare': 'compare' });
    router.start(true); // hashMode = true

    // 创建 AppShell 实例
    const app = new AppShell();
    document.getElementById('app')!.appendChild(app.el);
}

bootstrap();
