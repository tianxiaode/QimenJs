/**
 * RouteListenAbility — 路由接收能力
 *
 * 组件声明此能力后，自动通过桥接事件监听路由变化，
 * EventBridgeAbility 的 initEventBridge 会自动调用子类的 onRouteChange(event)。
 *
 * 子类只需定义 onRouteChange 方法即可接收路由变化事件，无需重写能力方法。
 *
 * 桥接配置：
 * { change: { source: 'router', match: '*' } }
 *
 * - key = 'change'：匹配 Router emit 的 change 事件
 * - match: '*'：监听 change 本身以及 change:xxx 的所有细分事件
 * - handler 默认推导为 onRouteChange（由 RouteListenAbility 的 _initRouteListen 中手动设置）
 *
 * 适用于：路由容器组件（RouteContainerComponent）等需要响应路由变化的接收方
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const RouteListenAbility: AbilityDefinition = {
    /** 由 InitAbility 的 __init__ 机制调用 */
    __init__: '_initRouteListen',

    /** 初始化路由监听 — 通过桥接事件配置实现 */
    _initRouteListen(): void {
        this.logger?.debug?.('[RouteListen] _initRouteListen');

        // 设置桥接事件配置，由 EventBridgeAbility 的 initEventBridge 处理监听
        // key = 'change' 匹配 Router emit 的 change 事件
        // match = '*' 监听 change 本身以及 change:xxx 的所有细分事件
        // handler = 'onRouteChange' 指定处理方法名
        if (typeof this.setEventBridge === 'function') {
            this.setEventBridge({
                change: {
                    source: 'router',
                    match: '*',
                    handler: 'onRouteChange',
                },
            });
        }

        // 初始化事件桥接
        if (typeof this.initEventBridge === 'function') {
            this.initEventBridge();
        }
    },
};
