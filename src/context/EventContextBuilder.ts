/**
 * 事件上下文构建器
 *
 * 使用构建器模式创建 EventContext 对象，提供流畅的链式 API。
 * 遵循与 RequestContextBuilder 相同的设计模式。
 *
 * @module context/EventContextBuilder
 */

import type { EventContext, EventChainLink } from './EventContext';

/**
 * 事件上下文构建器
 *
 * @example
 * ```typescript
 * const ctx = EventContextBuilder
 *     .create()
 *     .withEvent('userTable:selectionChange')
 *     .withType('selectionChange')
 *     .withSource('userTable')
 *     .withSourceType('UserTable')
 *     .withData({ rows: [], selectedCount: 0 })
 *     .withBusId(bus.getBusId())
 *     .withChain(previousChain)
 *     .build();
 * ```
 */
export class EventContextBuilder {
    private context: Partial<EventContext>;

    private constructor() {
        this.context = {
            steps: [],
            metadata: {},
        };
    }

    /**
     * 创建新的构建器实例
     */
    static create(): EventContextBuilder {
        return new EventContextBuilder();
    }

    /**
     * 设置事件名（完整名，如 userTable:selectionChange）
     */
    withEvent(event: string): this {
        this.context.event = event;
        return this;
    }

    /**
     * 设置事件类型（如 selectionChange）
     */
    withType(type: string): this {
        this.context.type = type;
        return this;
    }

    /**
     * 设置事件源
     */
    withSource(source: any): this {
        this.context.source = source;
        return this;
    }

    /**
     * 设置事件源类型（组件类名）
     */
    withSourceType(sourceType: string): this {
        this.context.sourceType = sourceType;
        return this;
    }

    /**
     * 设置事件数据载荷
     */
    withData(data: any): this {
        this.context.data = data;
        return this;
    }

    /**
     * 设置时间戳
     */
    withTimestamp(timestamp: number): this {
        this.context.timestamp = timestamp;
        return this;
    }

    /**
     * 设置总线 ID
     */
    withBusId(busId: string): this {
        this.context.busId = busId;
        return this;
    }

    /**
     * 设置作用域 ID
     */
    withScopeId(scopeId: string): this {
        this.context.scopeId = scopeId;
        return this;
    }

    /**
     * 设置原始 DOM 事件
     */
    withDomEvent(domEvent: Event): this {
        this.context.domEvent = domEvent;
        return this;
    }

    /**
     * 设置事件传播链
     */
    withChain(chain?: EventChainLink[]): this {
        this.context.chain = chain;
        return this;
    }

    /**
     * 设置引用计数（框架内部使用）
     */
    withRefCount(count: number): this {
        this.context._refCount = count;
        return this;
    }

    /**
     * 设置元数据
     */
    withMetadata(key: string, value: any): this {
        if (!this.context.metadata) this.context.metadata = {};
        this.context.metadata[key] = value;
        return this;
    }

    /**
     * 构建最终事件上下文
     *
     * @throws Error 如果缺少必要字段
     * @returns 完整的 EventContext 对象
     */
    build(): EventContext {
        if (!this.context.event) {
            throw new Error('EventContext is missing event name');
        }
        if (this.context.timestamp === undefined) {
            this.context.timestamp = Date.now();
        }
        if (this.context.busId === undefined) {
            this.context.busId = '';
        }
        if (this.context.scopeId === undefined) {
            this.context.scopeId = 'NO_SCOPE';
        }
        if (this.context.source === undefined) {
            this.context.source = 'UNKNOWN';
        }
        return this.context as EventContext;
    }
}
