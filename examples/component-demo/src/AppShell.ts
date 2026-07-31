/**
 * AppShell - 应用外壳组件
 *
 * 通用网页布局：Header + Content + Footer
 * 使用 RouteContainerComponent 订阅路由事件切换页面内容。
 *
 * 模板节点：
 * - header    — 头部区域 (AppHeaderComponent)
 * - content   — 内容区域 (RouteContainerComponent)
 * - footer    — 底部区域 (AppFooterComponent)
 */

import { Component, TplNode } from '@qimenjs/component-core';
import { NavbarComponent, RouteContainerComponent } from '@qimenjs/component';

import { AppFooterComponent } from './components/AppFooter';
import { HomePage } from './pages/HomePage';
// import { ComponentsPage } from './pages/ComponentsPage';
// import { TemplatesPage } from './pages/TemplatesPage';
// import { LoginPage } from './pages/LoginPage';

export const APP_SHELL_TPL: TplNode = {
    tag: 'div',
    cls: 'q-app-shell',
    flex: { direction: 'column' },
    children: [
        {
            name: 'header',
            type: NavbarComponent,
            initConfig: {
                items: [
                    { type: 'text', text: 'i18n:home', path: '/', icon: 'home' },
                    {
                        type: 'text',
                        text: 'i18n:components',
                        path: '/templates',
                        icon: 'fa-solid fa-house',
                    },
                    {
                        type: 'text',
                        text: 'i18n:templates',
                        path: '/teplates',
                        icon: 'fa-solid fa-cubs',
                    },
                    { type: 'text', text: 'i18n:home', path: '/', icon: 'fa-solid fa-layer-group' },
                    { type: 'space' },
                ],
            },
        },
        {
            name: 'content',
            type: RouteContainerComponent,
            cls: 'q-app-content',
            initConfig: {
                routeMap: {
                    '/': HomePage,
                    // '/components': ComponentsPage,
                    // '/templates': TemplatesPage,
                    // '/login': LoginPage,
                },
                defaultComponent: HomePage,
            },
        },
        // {
        //     name: 'footer',
        //     type: AppFooterComponent,
        //     cls: 'q-app-footer',
        // },
    ],
};

class AppShellBase extends Component {}

AppShellBase.useTemplate(APP_SHELL_TPL);
