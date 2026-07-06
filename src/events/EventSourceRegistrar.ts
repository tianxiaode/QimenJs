/**
 * 事件源注册器 - 校验 eventKey 的全局唯一性
 *
 * EventSourceRegistrar 确保每个 eventKey 在整个应用中只被注册一次，
 * 防止不同组件使用相同 eventKey 导致事件名冲突。
 *
 * @module events/EventSourceRegistrar
 */

import { ILogger, Logger } from '@qimenjs/logger';

/**
 * 事件源注册器
 *
 * 提供全局的 eventKey 唯一性校验。组件在声明 eventKey 时，
 * 应通过 EventSourceRegistrar 注册，重复注册会抛出错误。
 *
 * @example
 * ```typescript
 * const registrar = EventSourceRegistrar.getInstance();
 *
 * // 注册 eventKey
 * registrar.register('userTable', userTableComponent);
 *
 * // 重复注册会抛错
 * registrar.register('userTable', anotherComponent); // Error!
 *
 * // 注销 eventKey
 * registrar.unregister('userTable');
 * ```
 */
export class EventSourceRegistrar {
    private readonly sources = new Map<string, object>();
    private readonly logger: ILogger;

    private static instance: EventSourceRegistrar;

    private constructor() {
        this.logger = Logger.for('EventSourceRegistrar');
    }

    /**
     * 获取单例实例
     */
    static getInstance(): EventSourceRegistrar {
        if (!EventSourceRegistrar.instance) {
            EventSourceRegistrar.instance = new EventSourceRegistrar();
        }
        return EventSourceRegistrar.instance;
    }

    /**
     * 注册 eventKey
     *
     * @param eventKey - 事件标识 key
     * @param component - 注册该 eventKey 的组件实例
     * @throws Error 如果 eventKey 已被其他组件注册
     */
    register(eventKey: string, component: object): void {
        const existing = this.sources.get(eventKey);
        if (existing && existing !== component) {
            const existingName = existing.constructor.name;
            const newName = component.constructor.name;
            throw new Error(
                `[EventSourceRegistrar] eventKey "${eventKey}" already registered by ${existingName}, cannot register by ${newName}`
            );
        }
        this.sources.set(eventKey, component);
        this.logger.debug(`Registered eventKey "${eventKey}" by ${component.constructor.name}`);
    }

    /**
     * 注销 eventKey
     *
     * @param eventKey - 要注销的事件标识 key
     */
    unregister(eventKey: string): void {
        if (this.sources.has(eventKey)) {
            this.sources.delete(eventKey);
            this.logger.debug(`Unregistered eventKey "${eventKey}"`);
        }
    }

    /**
     * 获取注册了指定 eventKey 的组件
     *
     * @param eventKey - 事件标识 key
     * @returns 注册的组件实例，如果未注册则返回 undefined
     */
    getComponent(eventKey: string): object | undefined {
        return this.sources.get(eventKey);
    }

    /**
     * 检查 eventKey 是否已注册
     *
     * @param eventKey - 事件标识 key
     * @returns 是否已注册
     */
    has(eventKey: string): boolean {
        return this.sources.has(eventKey);
    }

    /**
     * 清空所有注册
     */
    clear(): void {
        this.sources.clear();
        this.logger.debug('Cleared all eventKey registrations');
    }
}
