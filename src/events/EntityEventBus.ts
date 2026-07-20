/**
 * EntityEventBus 实体事件总线
 *
 * 统一管理所有实体事件的发送和监听，使用独立的 eventScope。
 * 类似 EventBridge 的设计，所有实体事件收发都经过同一个 scopeId。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - entityEmit：发送实体事件，自动编码 entityKey + eventName
 * - entityOn：监听实体事件，按 entityKey + eventName 匹配
 * - 事件名编码：entity:{entityKey}:{eventName}
 *
 * @example
 * ```ts
 * const bus = EntityEventBus.getInstance();
 *
 * // 发送实体事件（组件侧）
 * bus.entityEmit('users', 'listed', { items: [...] });
 *
 * // 监听实体事件（组件侧）
 * const off = bus.entityOn('users', 'listed', (data) => {
 *     console.log('列表加载:', data);
 * });
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';

function encodeEntityEvent(entityKey: string, eventName: string): string {
    return `entity:${entityKey}:${eventName}`;
}

export class EntityEventBus {
    private static instance: EntityEventBus;

    private readonly entityScope: IEventScope;
    private readonly logger: ILogger;

    private constructor() {
        this.entityScope = globalEventBus.createEventScope();
        this.logger = Logger.for('entity-bus');
        this.logger.debug?.(
            '[EntityEventBus] initialized, scopeId =',
            this.entityScope.getScopeId()
        );
    }

    static getInstance(): EntityEventBus {
        if (!EntityEventBus.instance) {
            EntityEventBus.instance = new EntityEventBus();
        }
        return EntityEventBus.instance;
    }

    getScopeId(): string {
        return this.entityScope.getScopeId();
    }

    /**
     * 发送实体事件（只接收 EventContext）
     *
     * 事件总线统一约定：只接收 EventContext，由发送方构建。
     * 从 ctx.source 提取 entityKey，从 ctx.type 提取 eventName。
     *
     * @param ctx - 预构建的 EventContext
     */
    entityEmit(ctx: EventContext): void {
        const entityKey = ctx.source;
        const eventName = ctx.type!;
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.logger.debug?.(
            '[EntityEventBus] entityEmit, entityKey =',
            entityKey,
            'eventName =',
            eventName
        );
        this.entityScope.emit(entityEvent, ctx);
    }

    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void {
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.logger.debug?.(
            '[EntityEventBus] entityOn, entityKey =',
            entityKey,
            'eventName =',
            eventName
        );
        return this.entityScope.on(entityEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    entityOnce(entityKey: string, eventName: string, handler: (data: any) => void): void {
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.entityScope.once(entityEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.entityScope.dispose();
        this.logger.debug?.('[EntityEventBus] disposed');
    }
}

export const entityEventBus = EntityEventBus.getInstance();
