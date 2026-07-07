/**
 * ComponentEventRegistry 组件事件注册表
 *
 * 管理组件级别的事件注册，确保事件名全局唯一
 * 与 EventSourceRegistrar 协作，在组件 dispose 时自动清理
 */

import type { ComponentBase } from './ComponentBase';

interface EventRegistration {
    /** 组件 id */
    componentId: string;
    /** 事件类型 */
    eventType: string;
    /** 完整事件名 */
    eventKey: string;
    /** 清理函数 */
    off: () => void;
}

export class ComponentEventRegistry {
    private static instance: ComponentEventRegistry;

    /** 注册表：eventKey → EventRegistration */
    private readonly registrations = new Map<string, EventRegistration>();

    /** 组件索引：componentId → Set<eventKey> */
    private readonly componentIndex = new Map<string, Set<string>>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ComponentEventRegistry {
        if (!ComponentEventRegistry.instance) {
            ComponentEventRegistry.instance = new ComponentEventRegistry();
        }
        return ComponentEventRegistry.instance;
    }

    /**
     * 注册组件事件
     *
     * @param component - 组件实例
     * @param eventType - 事件类型
     * @param handler - 事件处理函数
     * @param eventBus - 事件总线实例
     * @returns 清理函数
     */
    register(
        component: ComponentBase,
        eventType: string,
        handler: (...args: any[]) => void,
        eventBus: any
    ): () => void {
        const componentId = component.id || component.cid;
        const eventKey = `${componentId}:${eventType}`;

        // 检查唯一性
        if (this.registrations.has(eventKey)) {
            console.warn(`ComponentEventRegistry: event "${eventKey}" already registered, replacing`);
            this.unregisterByKey(eventKey);
        }

        // 在 EventBus 上注册
        const off = eventBus.on(eventKey, handler);

        // 记录注册信息
        const registration: EventRegistration = {
            componentId,
            eventType,
            eventKey,
            off,
        };

        this.registrations.set(eventKey, registration);

        // 更新组件索引
        if (!this.componentIndex.has(componentId)) {
            this.componentIndex.set(componentId, new Set());
        }
        this.componentIndex.get(componentId)!.add(eventKey);

        // 返回清理函数
        return () => this.unregisterByKey(eventKey);
    }

    /**
     * 按事件键取消注册
     */
    unregisterByKey(eventKey: string): void {
        const registration = this.registrations.get(eventKey);
        if (!registration) return;

        // 调用 EventBus 的 off
        registration.off();

        // 从组件索引中移除
        const keys = this.componentIndex.get(registration.componentId);
        if (keys) {
            keys.delete(eventKey);
            if (keys.size === 0) {
                this.componentIndex.delete(registration.componentId);
            }
        }

        // 从注册表中移除
        this.registrations.delete(eventKey);
    }

    /**
     * 按组件 id 取消所有注册
     */
    unregisterByComponent(componentId: string): void {
        const keys = this.componentIndex.get(componentId);
        if (!keys) return;

        for (const eventKey of keys) {
            const registration = this.registrations.get(eventKey);
            if (registration) {
                registration.off();
                this.registrations.delete(eventKey);
            }
        }

        this.componentIndex.delete(componentId);
    }

    /**
     * 检查事件是否已注册
     */
    has(eventKey: string): boolean {
        return this.registrations.has(eventKey);
    }

    /**
     * 获取组件的所有事件注册
     */
    getComponentEvents(componentId: string): string[] {
        const keys = this.componentIndex.get(componentId);
        return keys ? Array.from(keys) : [];
    }

    /**
     * 获取注册总数
     */
    get size(): number {
        return this.registrations.size;
    }
}
