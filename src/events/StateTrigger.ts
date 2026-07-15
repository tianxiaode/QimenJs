import type { EventContext } from '@/context';
import { globalEventBus, EventSourceRegistrar } from '@/events';
import { EventFlowRegistrar } from './EventFlowRegistrar';
import type { EventListen } from '../component-core/layout-types';

/**
 * 绑定事件监听（bridges.on）
 *
 * 遍历 EventListen 数组，为每个监听建立 source:event → handler 映射。
 * handler 执行时通过 executeWithEventContext 包装，确保 chain 正确构建。
 *
 * 绑定策略（基于 source 查找组件实例）：
 * - 有 source 且 source 组件存在 → 监听该组件的 eventScope（scopeId 内部自动绑定）
 * - 有 source 但 source 组件不存在 → 监听全局事件总线（source:event 格式）
 * - 无 source → 监听全局事件总线（event 格式）
 *
 * @param listens - EventListen 数组
 * @param component - 接收方组件实例
 * @returns 取消所有订阅的函数 + 订阅记录数组
 */
export function bindEventListens(
    listens: EventListen[],
    component: object
): { off: () => void; subscriptions: EventListenSubscription[] } {
    const subscriptions: EventListenSubscription[] = [];
    const offs: Array<() => void> = [];

    for (const listen of listens) {
        const method = listen.once ? 'once' : 'on';

        if (listen.source) {
            // 尝试查找 source 组件
            const sourceComponent = EventSourceRegistrar.getInstance().getComponent(listen.source);

            if (sourceComponent && typeof (sourceComponent as any)[method] === 'function') {
                // source 组件存在 → 监听该组件的 eventScope（scopeId 隔离）
                for (const [event, handlerName] of Object.entries(listen.events)) {
                    const off = (sourceComponent as any)[method](event, (ctx: EventContext) => {
                        invokeHandler(component, handlerName, ctx);
                    });
                    offs.push(off);
                    subscriptions.push({
                        component,
                        event: `${listen.source}:${event}`,
                        handler: handlerName,
                        off,
                    });
                }
            } else {
                // source 组件不存在 → 监听全局事件总线（降级策略）
                for (const [event, handlerName] of Object.entries(listen.events)) {
                    const off = (globalEventBus as any)[method](event, (ctx: EventContext) => {
                        invokeHandler(component, handlerName, ctx);
                    });
                    offs.push(off);
                    subscriptions.push({
                        component,
                        event: `${listen.source}:${event}`,
                        handler: handlerName,
                        off,
                    });
                }
            }
        } else {
            // 无 source → 监听全局事件总线
            for (const [event, handlerName] of Object.entries(listen.events)) {
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

    // 注册到 EventFlowRegistrar（订阅层）
    const flowRegistrar = EventFlowRegistrar.getInstance();
    for (const sub of subscriptions) {
        flowRegistrar.registerSubscription(sub);
    }

    return {
        off: () => offs.forEach(fn => fn()),
        subscriptions,
    };
}

/**
 * 事件监听订阅记录
 *
 * 记录运行时的订阅关系，用于生命周期管理和调试。
 */
export interface EventListenSubscription {
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
