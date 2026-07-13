/**
 * RouteAbility — 路由监听能力
 *
 * 容器组件声明此能力后，自动监听路由切换事件。
 *
 * 路由事件命名：change 或 change:路径（source='router'）
 * 组件通过 EventBridgeAbility 监听 router 源的 change 事件，
 * 用 match 过滤只关心的路径事件。
 *
 * 监听策略：通过 EventSourceRegistrar 查找 router 实例，
 * 在其 eventScope 上监听（scopeId 隔离），不再直接使用 globalEventBus。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { EventSourceRegistrar } from '@qimenjs/events';
import { Router } from './Router';
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
    }): void {
        this.setAbilityState('RouteAbility:config', config);

        this.logger?.debug?.('[RouteAbility] setupRoute, routes =', Object.keys(config.routes), 'defaultPath =', config.defaultPath, 'hashMode =', config.hashMode);

        const router = Router.getInstance();
        router.register(config.routes);

        // 统一监听 router 的 change 事件
        const routerSource = EventSourceRegistrar.getInstance().getComponent('router');
        if (routerSource && typeof (routerSource as any).on === 'function') {
            const off = (routerSource as any).on('change', (ctx: any) => {
                this.logger?.debug?.('[RouteAbility] route change event received, data =', ctx.data);
                this._handleRouteChange(ctx.data as RouteChangeEvent);
            });
            this.onCleanup(off);
        } else {
            this.logger?.debug?.('[RouteAbility] router source NOT found in EventSourceRegistrar');
        }

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
        this.logger?.debug?.('[RouteAbility] _initRoute, hasRouteConfig =', !!routeConfig);
        if (routeConfig) {
            this.setupRoute(routeConfig);
        }
    },

    /**
     * 处理路由变化
     *
     * Router 已直接发 change / change:路径 事件，
     * 此处仅附加路由配置值（routeName），供组件内部使用。
     */
    _handleRouteChange(event: RouteChangeEvent): void {
        this.logger?.debug?.('[RouteAbility] _handleRouteChange, path =', event?.path);

        // 附加路由配置值（如 '/': 'home' 中的 'home'）
        const config = this._routeConfig;
        if (config?.routes && event && config.routes[event.path] !== undefined) {
            (event as any).routeName = config.routes[event.path];
        }
    },
};
