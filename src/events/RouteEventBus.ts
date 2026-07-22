/**
 * RouteEventBus 路由事件总线
 *
 * 统一管理所有路由导航事件的发送和监听，使用独立的 eventScope，
 * 与组件事件、桥接事件、实体事件、浮层事件互不干扰。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - routeEmit：发送路由事件，自动编码 routeKey + eventName
 * - routeOn：监听路由事件，支持 match 通配（'*' 匹配所有细分事件）
 * - 事件名编码：route:{routeKey}:{eventName}
 *
 * 路由事件命名规则：
 * - 无路径时发 change
 * - 有路径时发 change:路径（/ 替换为 :）
 * 例如路径 /users/list → 事件名 change:users:list
 *
 * @example
 * ```ts
 * const bus = RouteEventBus.getInstance();
 *
 * // Router 发送路由变化事件
 * bus.routeEmit('router', 'change', ctx);
 * bus.routeEmit('router', 'change:users:list', ctx);
 *
 * // 组件监听路由变化
 * const off = bus.routeOn('router', 'change', (data) => {
 *     console.log('路由变化:', data);
 * });
 *
 * // 监听特定路径
 * bus.routeOn('router', 'change:users', (data) => {
 *     console.log('进入用户页:', data);
 * });
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';

function encodeRouteEvent(routeKey: string, eventName: string): string {
    return `route:${routeKey}:${eventName}`;
}

export class RouteEventBus {
    private static instance: RouteEventBus;

    private readonly routeScope: IEventScope;
    private readonly logger: ILogger;

    private constructor() {
        this.routeScope = globalEventBus.createEventScope();
        this.logger = Logger.for('route-bus');
        this.logger.debug?.('[RouteEventBus] initialized, scopeId =', this.routeScope.getScopeId());
    }

    static getInstance(): RouteEventBus {
        if (!RouteEventBus.instance) {
            RouteEventBus.instance = new RouteEventBus();
        }
        return RouteEventBus.instance;
    }

    getScopeId(): string {
        return this.routeScope.getScopeId();
    }

    /**
     * 发送路由事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 routeKey，从 ctx.type 提取 eventName。
     *
     * @param ctx - 预构建的 EventContext
     */
    routeEmit(ctx: EventContext): void {
        const routeKey = ctx.source;
        const eventName = ctx.type!;
        const routeEvent = encodeRouteEvent(routeKey, eventName);
        this.logger.debug?.(
            '[RouteEventBus] routeEmit, routeKey =',
            routeKey,
            'eventName =',
            eventName
        );
        this.routeScope.emit(routeEvent, ctx);
    }

    /**
     * 监听路由事件
     *
     * @param routeKey - 路由源标识（通常为 'router'）
     * @param eventName - 事件名称（如 'change'、'change:users'）
     * @param handler - 事件处理函数
     * @returns 返回取消监听的函数
     */
    routeOn(routeKey: string, eventName: string, handler: (data: any) => void): () => void {
        const routeEvent = encodeRouteEvent(routeKey, eventName);
        this.logger.debug?.(
            '[RouteEventBus] routeOn, routeKey =',
            routeKey,
            'eventName =',
            eventName
        );
        return this.routeScope.on(routeEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 一次性监听路由事件
     *
     * @param routeKey - 路由源标识
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     */
    routeOnce(routeKey: string, eventName: string, handler: (data: any) => void): void {
        const routeEvent = encodeRouteEvent(routeKey, eventName);
        this.routeScope.once(routeEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.routeScope.dispose();
        this.logger.debug?.('[RouteEventBus] disposed');
    }
}

export const routeEventBus = RouteEventBus.getInstance();
