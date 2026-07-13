/**
 * RouteListenAbility — 路由接收能力
 *
 * 组件声明此能力后，自动通过桥接事件监听路由变化，
 * 桥接配置声明 events: { change: 'onRouteChange' }，
 * EventBridgeAbility 的 initEventBridge 会自动调用子类的 onRouteChange(event)。
 *
 * 子类只需定义 onRouteChange 方法即可接收路由变化事件，无需重写能力方法。
 *
 * 桥接配置：
 * { source: 'router', events: { change: 'onRouteChange' }, match: '*' }
 *
 * - events: 事件映射，change → onRouteChange（由桥接自动调用）
 * - match: 路径粒度匹配
 *   - '*' : 监听所有路由变化（监听 route:change）
 *   - 'home,icons,theme' : 只监听指定路径（监听 route:change:home 等）
 *
 * 默认 match 为 '*'，即监听所有路由变化。
 * 子类如需精确匹配，可在构造函数中调用 setEventBridge 覆盖配置。
 *
 * 适用于：路由容器组件（RouteContainerComponent）等需要响应路由变化的接收方
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const RouteListenAbility: AbilityDefinition = {
    /** 由 InitAbility 的 __init__ 机制调用 */
    __init__: '_initRouteListen',

    /** 初始化路由监听 — 通过桥接事件配置实现 */
    _initRouteListen(): void {
        // 设置桥接事件配置，由 EventBridgeAbility 的 initEventBridge 处理监听
        // 桥接声明 events: { change: 'onRouteChange' }，自动调用子类的 onRouteChange
        if (typeof this.setEventBridge === 'function') {
            this.setEventBridge({
                route: {
                    source: 'router',
                    events: { change: 'onRouteChange' },
                    match: '*',
                },
            });
        }

        // 初始化事件桥接
        if (typeof this.initEventBridge === 'function') {
            this.initEventBridge();
        }
    },
};
