/**
 * RouteAbility — 路由监听能力
 *
 * 容器组件声明此能力后，自动监听路由切换事件。
 *
 * 新模式：路由只发切换事件（事件名由路径 / 替换为 :），
 * 不再自动切换子组件。组件通过 EventBridgeAbility 监听 router 源事件
 * 或在此能力中监听路径对应的事件来实现刷新。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { globalEventBus } from '@qimenjs/events';
import { Router, pathToEventName } from './Router';
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

        const router = Router.getInstance();
        router.register(config.routes);

        // 监听路由字典中所有路径对应的切换事件
        for (const path of Object.keys(config.routes)) {
            const eventName = pathToEventName(path);
            const off = globalEventBus.on(eventName, (ctx: any) => {
                this._handleRouteChange(ctx.data as RouteChangeEvent);
            });
            this.onCleanup(off);
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
        if (routeConfig) {
            this.setupRoute(routeConfig);
        }
    },

    /**
     * 处理路由变化
     *
     * 新模式下路由只发事件，组件可在此处理路径切换逻辑。
     * 默认行为：发出 route:change 事件供 EventBridgeAbility 监听。
     */
    _handleRouteChange(event: RouteChangeEvent): void {
        // 发出统一的 route:change 事件，供 EventBridgeAbility 监听
        if (typeof this.emit === 'function') {
            this.emit('route:change', event);
        }
    },
};
