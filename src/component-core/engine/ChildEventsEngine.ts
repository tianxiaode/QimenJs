/**
 * ChildEventsEngine — 子组件事件订阅引擎
 *
 * 事件体系 ②：nodeMap 子组件的 child.on() 订阅
 *
 * Pipeline FINALIZE 阶段在 bindListens 之后执行（bindChildEvents），
 * 因为需要子组件已实例化（INSTANTIATE 阶段完成）。
 *
 * 两种格式：
 *   简写：{ childEvents: { toolbar: ['save', 'create'] } }
 *     → nodeMap.toolbar.on('save', this.onToolbarSave)
 *
 *   详细：{ childEvents: { toolbar: {
 *       save:    { handler: true, emits: ['save'] },
 *       create:  { emits: ['create'] },
 *       delete:  { entities: 'remove' },
 *   } } }
 *
 * 转发统一走 EventForwarder.forward()，EventContext 结构与 DomEventsEngine 一致。
 * 解绑通过 instance.onCleanup() 自动完成。
 *
 * 仅限直接子组件，跨层走桥接（ListensEngine）。
 */

import type { ChildEventConfig, ChildEventsListen } from '../types/tpl-node-types';
import { EventForwarder } from './EventForwarder';

export class ChildEventsEngine {
    /**
     * 为组件实例绑定 childEvents 声明的子组件事件订阅
     */
    static bindChildEvents(
        instance: any,
        childEvents: Record<string, string[] | Record<string, ChildEventConfig>>
    ): void {
        if (!childEvents || !instance.nodeMap) return;

        for (const [nodeName, eventDecl] of Object.entries(childEvents)) {
            const child = instance.nodeMap[nodeName]?.component ?? instance.nodeMap[nodeName];
            if (!child || typeof child.on !== 'function') {
                console.warn(
                    `ChildEventsEngine: nodeMap["${nodeName}"] not found or not a component`
                );
                continue;
            }

            if (Array.isArray(eventDecl)) {
                ChildEventsEngine._bindShorthand(instance, child, nodeName, eventDecl);
            } else {
                ChildEventsEngine._bindDetailed(instance, child, nodeName, eventDecl);
            }
        }
    }

    private static _bindShorthand(
        instance: any,
        child: any,
        nodeName: string,
        eventNames: string[]
    ): void {
        for (const eventName of eventNames) {
            const methodName = ChildEventsEngine._deriveMethodName(nodeName, eventName);
            const method = instance[methodName];
            if (typeof method !== 'function') {
                console.warn(`ChildEventsEngine: method "${methodName}" not found on component`);
                continue;
            }

            const handler = method.bind(instance);
            child.on(eventName, handler);
            instance.onCleanup(() => child.off(eventName, handler));
        }
    }

    private static _bindDetailed(
        instance: any,
        child: any,
        nodeName: string,
        eventConfigs: Record<string, ChildEventConfig>
    ): void {
        for (const [eventName, config] of Object.entries(eventConfigs)) {
            const handler = ChildEventsEngine._createDetailedHandler(
                instance,
                nodeName,
                eventName,
                config
            );

            if (config.once) {
                let called = false;
                const original = handler;
                const onceHandler = (...args: any[]) => {
                    if (called) return;
                    called = true;
                    child.off(eventName, onceHandler);
                    return original(...args);
                };
                child.on(eventName, onceHandler);
                instance.onCleanup(() => child.off(eventName, onceHandler));
            } else {
                child.on(eventName, handler);
                instance.onCleanup(() => child.off(eventName, handler));
            }
        }
    }

    /**
     * 创建详细配置的事件处理器
     *
     * handler 本地调用 + EventForwarder 统一转发
     */
    private static _createDetailedHandler(
        instance: any,
        nodeName: string,
        eventName: string,
        config: ChildEventConfig
    ): (...args: any[]) => void {
        return (...args: any[]) => {
            const data = args[0];

            if (config.handler) {
                const methodName = ChildEventsEngine._deriveMethodName(nodeName, eventName);
                const method = instance[methodName];
                if (typeof method === 'function') {
                    method.call(instance, ...args);
                }
            }

            EventForwarder.forward(instance, config, data);
        };
    }

    /**
     * 从 listens 数组中提取 childEvents 配置
     */
    static extractChildEvents(
        listens: any[]
    ): Record<string, string[] | Record<string, ChildEventConfig>> | null {
        if (!listens?.length) return null;
        for (const item of listens) {
            if (item.childEvents) return item.childEvents;
        }
        return null;
    }

    /**
     * 推导方法名：on${PascalCase(nodeName)}${PascalCase(eventName)}
     *
     * toolbar + save → onToolbarSave
     * grid + rowClick → onGridRowClick
     */
    private static _deriveMethodName(nodeName: string, eventName: string): string {
        const pascalNode = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
        const pascalEvent = eventName.charAt(0).toUpperCase() + eventName.slice(1);
        return `on${pascalNode}${pascalEvent}`;
    }
}
