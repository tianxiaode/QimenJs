/**
 * RouteEventBus 路由事件总线
 *
 * 统一管理所有路由导航事件的发送和监听，使用独立的 eventScope，
 * 与组件事件、桥接事件、实体事件、浮层事件互不干扰。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - routeEmit：发送路由事件，直接用 ctx.type 作为事件名
 * - routeOn：监听路由事件，支持 match 通配（'*' 匹配所有细分事件）
 * - 事件名即为 eventName 本身（如 'switch'、'change'、'change:users:list'）
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
 * bus.routeEmit(ctx);  // ctx.type = 'change' 或 'change:users:list'
 *
 * // 组件监听路由变化
 * const off = bus.routeOn('change', (data) => {
 *     console.log('路由变化:', data);
 * });
 *
 * // 监听特定路径
 * bus.routeOn('change:users', (data) => {
 *     console.log('进入用户页:', data);
 * });
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';

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
     * 直接用 ctx.type 作为事件名，不再编码 routeKey。
     *
     * @param ctx - 预构建的 EventContext
     */
    routeEmit(ctx: EventContext): void {
        const eventName = ctx.type!;
        this.logger.debug?.(
            '[RouteEventBus] routeEmit, eventName =',
            eventName
        );
        this.routeScope.emit(eventName, ctx);
    }

    /**
     * 监听路由事件
     *
     * @param eventName - 事件名称（如 'switch'、'change'、'change:users'）
     * @param handler - 事件处理函数
     * @returns 返回取消监听的函数
     */
    routeOn(eventName: string, handler: (data: any) => void): () => void {
        this.logger.debug?.(
            '[RouteEventBus] routeOn, eventName =',
            eventName
        );
        return this.routeScope.on(eventName, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 一次性监听路由事件
     *
     * @param eventName - 事件名称
     * @param handler - 事件处理函数
     */
    routeOnce(eventName: string, handler: (data: any) => void): void {
        this.routeScope.once(eventName, (ctx: any) => {
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
