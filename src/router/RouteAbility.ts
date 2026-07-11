/**
 * RouteAbility — 路由监听能力
 *
 * 容器组件声明此能力后，自动监听路由变化，根据路由配置切换子组件。
 *
 * 默认行为（自动切换）：
 * - 路由变化时，从路由字典查找配置
 * - 配置是 LayoutNode → removeAll() + add(layout)
 * - 配置是 HTML 模板字符串 → removeAll() + 重新注入模板
 * - 配置是字符串引用 → 已由 Router.resolveConfig() 解析
 *
 * 自定义行为：
 * - 在 route 配置中声明 onRouteChange 回调，覆盖默认切换逻辑
 *
 * 声明式用法（LayoutNode）：
 * ```typescript
 * {
 *     type: 'VBox',
 *     id: 'main-content',
 *     route: {
 *         routes: {
 *             '/': 'HomePage',           // 字符串引用 → TemplateRegistrar
 *             '/users': { type: 'VBox', children: [...] }, // 直接 LayoutNode
 *             '/about': '<div>...</div>', // 直接 HTML 模板
 *         },
 *         defaultPath: '/',
 *     },
 * }
 * ```
 *
 * 编程式用法：
 * ```typescript
 * class MyContainer extends ComponentBase {
 *     static readonly abilities = [RouteAbility, ChildrenAbility, ...];
 * }
 * const container = new MyContainer();
 * container.setupRoute({
 *     routes: { '/': 'HomePage', '/users': 'UserPage' },
 *     onRouteChange: (event) => { /* 自定义切换逻辑 *\/ },
 * });
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { globalEventBus } from '@qimenjs/events';
import { Router, ROUTE_CHANGE_EVENT } from './Router';
import type { RouteMap, RouteChangeEvent } from './types';

export const RouteAbility: AbilityDefinition = {
    /**
     * 初始化路由监听
     *
     * 由 InitAbility 的 __init__ 机制调用。
     */
    __init__: '_initRoute',

    /**
     * 路由配置
     */
    _routeConfig: {
        get() {
            return this.abilityState('RouteAbility:config', () => null as any);
        },
    },

    /**
     * 设置路由配置并启动监听
     *
     * @param config - 路由配置
     */
    setupRoute(config: {
        routes: RouteMap;
        defaultPath?: string;
        hashMode?: boolean;
        onRouteChange?: (event: RouteChangeEvent) => void;
    }): void {
        this.setAbilityState('RouteAbility:config', config);

        const router = Router.getInstance();
        router.register(config.routes);

        // 监听路由变化
        const off = globalEventBus.on(ROUTE_CHANGE_EVENT, (ctx: any) => {
            this._handleRouteChange(ctx.data as RouteChangeEvent);
        });
        this.onCleanup(off);

        // 启动路由
        router.start(config.hashMode ?? true);

        // 如果有默认路径且当前无路径，导航到默认路径
        if (config.defaultPath && !router.getPath()) {
            router.navigate(config.defaultPath, true);
        }
    },

    /**
     * 初始化路由（由 __init__ 调用）
     *
     * 检查 LayoutNode 中的 route 配置，自动设置路由监听。
     */
    _initRoute(): void {
        // 从 props 中读取 route 配置
        const routeConfig = this.props?.route;
        if (routeConfig) {
            this.setupRoute(routeConfig);
        }
    },

    /**
     * 处理路由变化
     */
    _handleRouteChange(event: RouteChangeEvent): void {
        const config = this._routeConfig;
        if (!config) return;

        // 如果有自定义回调，优先使用
        if (config.onRouteChange) {
            config.onRouteChange(event);
            return;
        }

        // 默认行为：自动切换子组件
        this._autoSwitchContent(event);
    },

    /**
     * 自动切换内容
     *
     * 根据路由配置自动替换容器的子组件。
     */
    _autoSwitchContent(event: RouteChangeEvent): void {
        const { config } = event;
        if (!config) return;

        // 清空现有子组件
        if (typeof this.removeAll === 'function') {
            this.removeAll();
        }

        // 根据配置类型渲染新内容
        if (typeof config === 'string') {
            // HTML 模板字符串
            this._renderTemplate(config);
        } else if (config && typeof config === 'object' && config.type) {
            // LayoutNode
            if (typeof this.add === 'function') {
                this.add(config);
            }
        }
    },

    /**
     * 渲染 HTML 模板字符串
     *
     * 将模板注入到容器的 el 中。
     */
    _renderTemplate(template: string): void {
        if (this.el) {
            this.el.innerHTML = template;
        }
    },
};
