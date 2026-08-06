/**
 * ShowcaseApp - 示范应用外壳
 *
 * 整体布局：Navbar(顶栏) + RouteContainer(内容区) + Footer(底栏)
 * 使用模板模式声明式组合，不使用 new 模式。
 */

import { Component, type TplNode } from '@qimenjs/component-core';
import {
    NavbarComponent,
    RouteContainerComponent,
    SpacerComponent,
    ToggleIconComponent,
    ButtonComponent,
} from '@qimenjs/component';
import { RouteEventBusAbility } from '@qimenjs/system-abilities';
import { EventContextBuilder } from '@qimenjs/context';
import { ThemeRegistrar } from '@qimenjs/theme';
import { HomePage } from './pages/HomePage';
import { ComponentsPage } from './pages/ComponentsPage';

/** 应用外壳模板 */
const SHOWCASE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-showcase',
    flex: { direction: 'column', minHeight: '100vh' },
    children: [
        {
            name: 'navbar',
            type: NavbarComponent,
            cls: 'q-showcase__navbar',
            initConfig: {
                companyName: 'QimenJS',
                logo: '⛩️',
                items: [
                    {
                        type: 'Button',
                        text: 'i18n:nav.home',
                        order: 100,
                        cls: 'q-showcase-nav-btn',
                    },
                    {
                        type: 'Button',
                        text: 'i18n:nav.components',
                        order: 200,
                        cls: 'q-showcase-nav-btn',
                    },
                    {
                        type: 'Button',
                        text: 'i18n:nav.templates',
                        order: 300,
                        cls: 'q-showcase-nav-btn',
                    },
                    {
                        type: 'Button',
                        text: 'i18n:nav.docs',
                        order: 400,
                        cls: 'q-showcase-nav-btn',
                    },
                    { type: 'Spacer', order: 500 },
                    {
                        type: 'ToggleIcon',
                        onIcon: '☀️',
                        offIcon: '🌙',
                        order: 600,
                        cls: 'q-showcase-dark-toggle',
                    },
                    {
                        type: 'Button',
                        text: 'i18n:common.login',
                        order: 700,
                        cls: 'q-showcase-login-btn',
                    },
                ],
            },
        },
        {
            name: 'content',
            type: RouteContainerComponent,
            cls: 'q-showcase__content',
            flex: { flex: 1 },
            initConfig: {
                routeMap: {
                    '/': HomePage,
                    '/components': ComponentsPage,
                },
                defaultComponent: HomePage,
            },
        },
        {
            name: 'footer',
            tag: 'footer',
            cls: 'q-showcase__footer',
            children: [
                { tag: 'span', i18n: 'footer.copyright' },
                { tag: 'span', i18n: 'footer.tagline' },
            ],
        },
    ],
};

/** 示范应用外壳组件 */
export class ShowcaseApp extends Component {
    _isDark = false;

    onAfterInit(): void {
        this._initRouteListener();
        this._initNavbarEvents();
    }

    /** 监听路由变化 */

    _initRouteListener(): void {
        this.routeOn('router', 'change', (data: any) => {
            this._updateNavHighlight(data?.path ?? '/');
        });
    }

    /** 绑定 Navbar 子组件事件 */
    _initNavbarEvents(): void {
        const navbar = this.nodeMap.navbar?.component;
        if (!navbar) return;

        const navBtns = navbar.el.querySelectorAll('.q-showcase-nav-btn');
        navBtns.forEach((btn: Element) => {
            const btnComp = (btn as any).__component;
            if (!btnComp) return;
            const text = btnComp.text ?? btn.textContent;
            btnComp.on('click', () => {
                if (text === '首页') this._navigateTo('/');
                else if (text === '组件') this._navigateTo('/components');
                else if (text === '模板') this._navigateTo('/templates');
                else if (text === '文档') this._navigateTo('/docs');
            });
        });

        const darkToggle = navbar.el.querySelector('.q-showcase-dark-toggle');
        if (darkToggle) {
            const toggleComp = (darkToggle as any).__component;
            if (toggleComp) {
                toggleComp.on('toggle', (data: any) => this._applyDarkMode(data?.on ?? false));
            }
        }
    }

    /** Dark 模式切换 */
    _applyDarkMode(isDark: boolean): void {
        this._isDark = isDark;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('qimenjs-theme', isDark ? 'dark' : 'light');
        const registrar = ThemeRegistrar.getInstance();
        const theme = isDark ? 'dark' : 'light';
        if (registrar.has(theme)) {
            registrar.apply(theme);
        }
    }

    /** 导航跳转 */
    _navigateTo(path: string): void {
        this.routeEmit(
            EventContextBuilder.create()
                .withEvent('switch')
                .withType('switch')
                .withSource('router')
                .withData({ path })
                .build()
        );
    }

    /** 更新导航高亮 */
    _updateNavHighlight(_path: string): void {
        // 后续实现导航高亮
    }
}

ShowcaseApp.use(RouteEventBusAbility);
ShowcaseApp.useTemplate(SHOWCASE_TPL);
