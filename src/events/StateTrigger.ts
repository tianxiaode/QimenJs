import type { EventContext } from '@/context';
import { globalEventBus, EventSourceRegistrar } from '@/events';

/**
 * StateTrigger 定义
 *
 * 接收方声明式事件绑定，用于组件间联动、数据联动、全局状态响应。
 * 接收方不需要知道发送方是谁，只需要知道事件名。
 */
export interface StateTrigger {
    /** 监听哪个事件源（组件 eventKey），不填则监听全局事件总线 */
    source?: string;
    /** 事件类型 → handler 方法名映射（event 是事件类型，如 "selectionChange"） */
    events: Record<string, string>;
    /** 只执行一次，执行后自动解绑 */
    once?: boolean;
}

/**
 * StateTrigger 订阅记录
 *
 * 记录运行时的订阅关系，用于生命周期管理和调试。
 */
export interface StateTriggerSubscription {
    /** 监听者组件 */
    component: object;
    /** 监听的事件名（完整事件名，如 "userTable:selectionChange"） */
    event: string;
    /** 触发时调用的方法名 */
    handler: string;
    /** 取消订阅函数 */
    off: () => void;
}

/**
 * 绑定 StateTrigger
 *
 * 遍历 StateTrigger 数组，为每个 trigger 建立 source:event → handler 映射。
 * handler 执行时通过 executeWithEventContext 包装，确保 chain 正确构建。
 *
 * 绑定策略：
 * - 有 source 且 source 组件存在 → 监听该组件的 eventScope
 * - 有 source 但 source 组件不存在 → 监听全局事件总线（source:event 格式）
 * - 无 source → 监听全局事件总线（event 格式）
 *
 * @param triggers - StateTrigger 数组
 * @param component - 接收方组件实例
 * @returns 取消所有订阅的函数 + 订阅记录数组
 */
export function bindStateTriggers(
    triggers: StateTrigger[],
    component: object
): { off: () => void; subscriptions: StateTriggerSubscription[] } {
    const subscriptions: StateTriggerSubscription[] = [];
    const offs: Array<() => void> = [];

    for (const trigger of triggers) {
        const method = trigger.once ? 'once' : 'on';

        if (trigger.source) {
            // 尝试查找 source 组件
            const sourceComponent = EventSourceRegistrar.getInstance().getComponent(trigger.source);

            if (sourceComponent && typeof (sourceComponent as any)[method] === 'function') {
                // source 组件存在 → 监听该组件的事件
                for (const [event, handlerName] of Object.entries(trigger.events)) {
                    const fullEvent = `${trigger.source}:${event}`;
                    const off = (sourceComponent as any)[method](fullEvent, (ctx: EventContext) => {
                        invokeHandler(component, handlerName, ctx);
                    });
                    offs.push(off);
                    subscriptions.push({
                        component,
                        event: fullEvent,
                        handler: handlerName,
                        off,
                    });
                }
            } else {
                // source 组件不存在 → 监听全局事件总线
                for (const [event, handlerName] of Object.entries(trigger.events)) {
                    const fullEvent = `${trigger.source}:${event}`;
                    const off = (globalEventBus as any)[method](fullEvent, (ctx: EventContext) => {
                        invokeHandler(component, handlerName, ctx);
                    });
                    offs.push(off);
                    subscriptions.push({
                        component,
                        event: fullEvent,
                        handler: handlerName,
                        off,
                    });
                }
            }
        } else {
            // 无 source → 监听全局事件总线
            for (const [event, handlerName] of Object.entries(trigger.events)) {
                const off = (globalEventBus as any)[method](event, (ctx: EventContext) => {
                    invokeHandler(component, handlerName, ctx);
                });
                offs.push(off);
                subscriptions.push({
                    component,
                    event,
                    handler: handlerName,
                    off,
                });
            }
        }
    }

    return {
        off: () => offs.forEach(fn => fn()),
        subscriptions,
    };
}

/**
 * 调用组件的 handler 方法
 *
 * 如果组件有 executeWithEventContext 方法，通过它包装执行（确保 chain 正确构建）。
 * 否则直接调用 handler。
 */
function invokeHandler(component: object, handlerName: string, ctx: EventContext): void {
    if (typeof (component as any)[handlerName] !== 'function') return;

    if (typeof (component as any).executeWithEventContext === 'function') {
        (component as any).executeWithEventContext(() => {
            (component as any)[handlerName](ctx);
        }, ctx);
    } else {
        (component as any)[handlerName](ctx);
    }
}
