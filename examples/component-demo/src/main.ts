/**
 * QimenJS 组件演示 — 入口
 *
 * 架构：
 * 1. AppShell = TemplateComponent.withTemplate
 *    - TopbarComponent：顶栏（品牌区+功能区），折叠按钮通过桥接事件 'sidebar:toggle' 通知侧边栏
 *    - SidebarComponent：侧边栏（RouteNavComponent），监听桥接事件切换折叠，通过 'nav:mode' 通知导航
 *    - RouteContainerComponent：路由容器
 * 2. 组件间通过桥接事件通信，AppShell 无需 nodeMap 操作
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
    RouteContainerComponent,
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

// ─── 页面组件 ───
import { HomePage } from './pages/home';
import { ThemePage } from './pages/theme';
import { ComponentsPage } from './pages/components';

// ─── 子组件 ───
import { TopbarComponent } from './components/TopbarComponent';
import { SidebarComponent } from './components/SidebarComponent';

// ─── AppShell ───

class AppShell extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'app-root',
        layout: 'vbox',
        children: [
            { name: 'shell:topbar', type: TopbarComponent },
            { tag: 'div', className: 'app-body', layout: 'hbox', children: [
                { name: 'shell:sidebar', type: SidebarComponent },
                { tag: 'div', className: 'app-content', layout: 'fit', children: [
                    { name: 'shell:page', type: RouteContainerComponent, props: {
                        routeMap: { '/': HomePage, '/components': ComponentsPage, '/theme': ThemePage },
                        defaultComponent: HomePage,
                    } },
                ]},
            ]},
        ],
    },
    body: {
        type: 'AppShell',
    },
}) {}

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
