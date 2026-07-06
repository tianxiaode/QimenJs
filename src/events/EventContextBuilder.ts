/**
 * UI 事件上下文构建器
 *
 * 使用构建器模式创建 EventContext 对象，提供流畅的链式 API。
 * 遵循与 RequestContextBuilder 相同的设计模式。
 *
 * @module events/EventContextBuilder
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
            event: '',
            type: '',
            source: '',
            sourceType: '',
            data: undefined,
            chain: undefined,
        };
    }

    /**
     * 创建新的构建器实例
     */
    static create(): EventContextBuilder {
        return new EventContextBuilder();
    }

    /**
     * 设置完整事件名（eventKey:type 格式）
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
     * 设置事件源标识（组件 eventKey）
     */
    withSource(source: string): this {
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
        this.context.metadata![key] = value;
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
        if (!this.context.type) {
            throw new Error('EventContext is missing event type');
        }
        return this.context as EventContext;
    }
}
