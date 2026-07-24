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

import { Component } from '@qimenjs/component-core';
import { RouteContainerComponent } from '@qimenjs/component';

import { AppHeaderComponent } from './components/AppHeader';
import { AppFooterComponent } from './components/AppFooter';
import { HomePage } from './pages/HomePage';
import { ComponentsPage } from './pages/ComponentsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { LoginPage } from './pages/LoginPage';

const AppShellBase = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-app-shell',
        flex: { direction: 'column' },
        children: [
            {
                name: 'header',
                type: AppHeaderComponent,
                cls: 'q-app-header',
            },
            {
                name: 'content',
                type: RouteContainerComponent,
                cls: 'q-app-content',
                initConfig: {
                    routeMap: {
                        '/': HomePage,
                        '/components': ComponentsPage,
                        '/templates': TemplatesPage,
                        '/login': LoginPage,
                    },
                    defaultComponent: HomePage,
                },
            },
            {
                name: 'footer',
                type: AppFooterComponent,
                cls: 'q-app-footer',
            },
        ],
    },
    body: {
        type: 'AppShell',
    },
});

export let AppShell = AppShellBase;

export type AppShell = InstanceType<typeof AppShellBase>;