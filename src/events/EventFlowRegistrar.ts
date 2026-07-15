import type { EventListen } from '../component-core/layout-types';

/**
 * EventFlowRegistrar - 事件流注册表
 *
 * 收集 bridges.on 的定义和运行时订阅关系。
 * 只做收集和生命周期管理，不做调度执行。
 *
 * 两层结构：
 * 1. 定义层（类级别，只注册一次）：组件类声明了哪些 bridges.on 监听
 * 2. 订阅层（实例级别，每个实例绑定）：运行时的 on/off 订阅关系
 *
 * 为什么不做调度：如果注册表接管调度，handler 执行时 this 会丢失。
 * 调度还是走现有的 emit + bridges.on，this 自然指向组件。
 */
export class EventFlowRegistrar {
    private static instance: EventFlowRegistrar;

    /** 定义层：组件类声明了哪些事件监听（类级别，只注册一次） */
    private readonly definitions = new Map<string, EventFlowDefinition>();

    /** 订阅层：运行时的订阅关系（实例级别，每个实例绑定） */
    private readonly subscriptions = new Map<string, EventFlowSubscription[]>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): EventFlowRegistrar {
        if (!EventFlowRegistrar.instance) {
            EventFlowRegistrar.instance = new EventFlowRegistrar();
        }
        return EventFlowRegistrar.instance;
    }

    // ============================================
    // 定义层
    // ============================================

    /**
     * 注册组件类的事件监听定义（同一类型只注册一次）
     */
    registerDefinition(def: EventFlowDefinition): void {
        if (this.definitions.has(def.componentType)) return;
        this.definitions.set(def.componentType, def);
    }

    /**
     * 查询组件类的事件监听定义
     */
    getDefinition(componentType: string): EventFlowDefinition | undefined {
        return this.definitions.get(componentType);
    }

    /**
     * 查询某个事件有哪些组件类型在监听（定义层）
     */
    getDefinitionListeners(event: string): EventFlowDefinition[] {
        const result: EventFlowDefinition[] = [];
        for (const def of this.definitions.values()) {
            for (const listen of def.listens) {
                if (listen.source) {
                    // 事件名不再拼凑 source 前缀，直接匹配 event
                    if (event in listen.events) {
                        result.push(def);
                        break;
                    }
                } else {
                    if (event in listen.events) {
                        result.push(def);
                        break;
                    }
                }
            }
        }
        return result;
    }

    // ============================================
    // 订阅层
    // ============================================

    /**
     * 注册一个运行时订阅
     */
    registerSubscription(entry: EventFlowSubscription): void {
        let entries = this.subscriptions.get(entry.event);
        if (!entries) {
            entries = [];
            this.subscriptions.set(entry.event, entries);
        }
        entries.push(entry);
    }

    /**
     * 按组件解绑所有订阅（组件销毁时调用）
     */
    unregisterByComponent(component: object): void {
        for (const [event, entries] of this.subscriptions) {
            const remaining = entries.filter(entry => {
                if (entry.component === component) {
                    entry.off();
                    return false;
                }
                return true;
            });
            if (remaining.length === 0) {
                this.subscriptions.delete(event);
            } else {
                this.subscriptions.set(event, remaining);
            }
        }
    }

    /**
     * 按事件名查询所有运行时监听者
     */
    getSubscriptions(event: string): EventFlowSubscription[] {
        return this.subscriptions.get(event) ?? [];
    }

    /**
     * 获取某个事件的运行时监听者数量
     */
    getSubscriptionCount(event: string): number {
        return this.subscriptions.get(event)?.length ?? 0;
    }

    // ============================================
    // 调试
    // ============================================

    /**
     * 调试：输出完整的事件监听关系图
     */
    inspect(): string {
        const lines: string[] = ['EventFlowRegistrar', ''];

        // 定义层
        lines.push('Definitions (类级别):');
        if (this.definitions.size === 0) {
            lines.push('  (empty)');
        } else {
            for (const [type, def] of this.definitions) {
                const listenStrs = def.listens.map(t => {
                    const source = t.source ? `${t.source} → ` : '';
                    const events = Object.entries(t.events)
                        .map(([e, h]) => `{ ${e}: ${h} }`)
                        .join(', ');
                    return `${source}${events}`;
                });
                lines.push(`  ${type} → [${listenStrs.join(', ')}]`);
            }
        }

        lines.push('');

        // 订阅层
        lines.push('Subscriptions (实例级别):');
        if (this.subscriptions.size === 0) {
            lines.push('  (empty)');
        } else {
            for (const [event, entries] of this.subscriptions) {
                for (const entry of entries) {
                    const compName = entry.component.constructor?.name || 'Unknown';
                    lines.push(`  ${event} → ${compName}.${entry.handler}`);
                }
            }
        }

        return lines.join('\n');
    }

    /**
     * 清空所有定义和订阅
     */
    clear(): void {
        // 先解绑所有订阅
        for (const entries of this.subscriptions.values()) {
            entries.forEach(entry => entry.off());
        }
        this.subscriptions.clear();
        this.definitions.clear();
    }
}

/**
 * 定义层：组件类声明了哪些事件监听（类级别，只注册一次）
 */
export interface EventFlowDefinition {
    /** 组件类型名 */
    componentType: string;
    /** 声明的事件监听 */
    listens: EventListen[];
}

/**
 * 订阅层：运行时的订阅关系（实例级别，每个实例绑定）
 */
export interface EventFlowSubscription {
    /** 监听者组件 */
    component: object;
    /** 监听的事件名（完整事件名，如 "userTable:selectionChange"） */
    event: string;
    /** 触发时调用的方法名 */
    handler: string;
    /** 取消订阅函数 */
    off: () => void;
}
