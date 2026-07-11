/**
 * QimenJS 组件演示 — 入口
 *
 * 测试内容：
 * 1. withTemplate 模式构建应用容器
 * 2. 主题切换（light/dark/中国色）
 * 3. 图标库（查看全部图标）
 * 4. 路由切换页面
 */

// ─── 注册主题 ───
import { registerPresetThemes, registerChineseThemes, ThemeRegistrar } from '@qimenjs/theme';
registerPresetThemes();
registerChineseThemes();

// ─── 引入样式 ───
// 图标 CSS 通过 index.html <link> 引入，确保字体文件被浏览器正确下载
import './styles.css';

// ─── 引入组件系统 ───
import { TemplateComponent } from '@qimenjs/component-core';
import { ChildrenAbility } from '@qimenjs/component-abilities';
import { RouteAbility } from '@qimenjs/router';

// ─── 页面模块 ───
import { HOME_TEMPLATE } from './pages/home';
import { ICONS_TEMPLATE, renderIconGrid } from './pages/icons';
import { THEME_TEMPLATE, renderThemePage, exposeThemeSwitch } from './pages/theme';
import { renderSidebar, updateNavHighlight } from './sidebar';

// ─── 启动应用 ───

function bootstrap(): void {
    // 应用默认主题
    ThemeRegistrar.getInstance().apply('light');

    // 暴露主题切换到 window
    exposeThemeSwitch();

    // 创建应用容器 — withTemplate 模式
    const AppContainer = TemplateComponent.withTemplate('<div class="app-root"></div>').with([
        RouteAbility, ChildrenAbility,
    ]);
    const app = new AppContainer();
    document.getElementById('app')!.appendChild(app.el);

    // 设置路由
    app.setupRoute({
        routes: {
            '/': HOME_TEMPLATE,
            '/icons': ICONS_TEMPLATE,
            '/theme': THEME_TEMPLATE,
        },
        defaultPath: '/',
        hashMode: true,
        onRouteChange: (event: any) => {
            console.log('[Route]', event.previousPath, '->', event.path, event.params);

            // 默认自动切换（RouteAbility 内置逻辑会处理 HTML 模板字符串）
            if (event.config) {
                app.removeAll();
                if (typeof event.config === 'string') {
                    app.el.innerHTML = event.config;
                } else if (typeof event.config === 'object' && event.config.type) {
                    app.add(event.config);
                }
            }

            // 页面级额外渲染
            if (event.path === '/icons') {
                renderIconGrid();
            }
            if (event.path === '/theme') {
                renderThemePage();
            }

            // 更新导航高亮
            updateNavHighlight(event.path);
        },
    });

    // 渲染侧边导航
    renderSidebar();
}

bootstrap();
