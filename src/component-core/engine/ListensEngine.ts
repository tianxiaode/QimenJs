/**
 * ListensEngine — 统一事件订阅引擎
 *
 * 事件体系 ②③：子组件事件订阅 + 外部事件订阅
 *
 * Pipeline 两个阶段：
 *   FINALIZE 早期 — source/entity/system/route/file 等外部事件（不依赖子组件实例）
 *   FINALIZE 晚期 — node 类型的子组件事件（依赖 nodeMap 已实例化）
 *
 * 统一支持本地监听 + 六路转发：
 *   handler 处理后自动走 EventForwarder.forward()，合并 defaultEventData + getCustomEventData
 *
 * 解绑通过 instance.onCleanup() 自动完成。
 */

import type {
    ListenItem,
    EventMapping,
    NodeListen,
    ComponentListen,
    EntityListen,
    SystemListen,
    RouteListen,
    FileListen,
} from '../types/tpl-node-types';
import { EventForwarder, type ForwardConfig } from './EventForwarder';
import {
    ComponentEventBus,
    EntityEventBus,
    SystemEventBus,
    RouteEventBus,
    FileEventBus,
} from '@/events';

function isNodeListen(item: ListenItem): item is NodeListen {
    return 'node' in item;
}
function isComponentListen(item: ListenItem): item is ComponentListen {
    return 'source' in item;
}
function isEntityListen(item: ListenItem): item is EntityListen {
    return 'entity' in item;
}
function isSystemListen(item: ListenItem): item is SystemListen {
    return 'system' in item;
}
function isRouteListen(item: ListenItem): item is RouteListen {
    return 'route' in item;
}
function isFileListen(item: ListenItem): item is FileListen {
    return 'file' in item;
}

export class ListensEngine {
    /**
     * 绑定外部事件订阅（不依赖子组件实例，FINALIZE 早期调用）
     */
    static bindListens(instance: any, listens: ListenItem[]): void {
        if (!listens?.length) return;

        for (const item of listens) {
            if (isComponentListen(item)) {
                ListensEngine._bindComponent(instance, item.source, item.events);
            } else if (isEntityListen(item)) {
                ListensEngine._bindEntity(instance, item.events);
            } else if (isSystemListen(item)) {
                ListensEngine._bindSystem(instance, item.events);
            } else if (isRouteListen(item)) {
                ListensEngine._bindRoute(instance, item.route, item.events);
            } else if (isFileListen(item)) {
                ListensEngine._bindFile(instance, item.file, item.events);
            }
        }
    }

    /**
     * 绑定子组件节点事件订阅（依赖子组件已实例化，FINALIZE 晚期调用）
     */
    static bindNodeEvents(instance: any, listens: ListenItem[]): void {
        if (!listens?.length || !instance.nodeMap) return;

        for (const item of listens) {
            if (isNodeListen(item)) {
                ListensEngine._bindNode(instance, item.node, item.events);
            }
        }
    }

    /**
     * 从 listens 数组中提取 node 配置
     */
    static extractNodeEvents(
        listens: ListenItem[]
    ): { node: string; events: Record<string, EventMapping> }[] {
        if (!listens?.length) return [];
        return listens.filter(isNodeListen).map(item => ({ node: item.node, events: item.events }));
    }

    // ─── 统一的事件处理器工厂 ───

    /**
     * 创建事件处理器：可选 handler 本地调用 + EventForwarder 六路转发
     *
     * 数据传递：
     *   forwardedData = { ...defaultEventData, ...getCustomEventData(), ...receivedData }
     *   receivedData 是事件触发时传入的原始数据
     *   defaultEventData 是 getter 返回的默认数据
     *   getCustomEventData() 是运行时收集的自定义数据
     */
    private static _createHandler(
        instance: any,
        eventName: string,
        mapping: EventMapping,
        nodeName?: string
    ): (...args: any[]) => void {
        return (...args: any[]) => {
            const data = args[0];

            // 1. 本地 handler 处理
            const handlerName = ListensEngine._resolveHandlerName(mapping, eventName, nodeName);
            if (handlerName) {
                const method = instance[handlerName];
                if (typeof method === 'function') {
                    method.call(instance, ...args);
                }
            }

            // 2. EventForwarder 六路转发
            const config = ListensEngine._extractForwardConfig(mapping);
            if (config) {
                EventForwarder.forward(instance, config, data, undefined, eventName);
            }
        };
    }

    /**
     * 解析 handler 方法名
     * - string → 直接作为方法名
     * - true → 自动推导（仅 node 类型有 nodeName）
     * - { handler: string } → 指定方法名
     * - { handler: true } → 自动推导
     */
    private static _resolveHandlerName(
        mapping: EventMapping,
        eventName: string,
        nodeName?: string
    ): string | undefined {
        if (mapping === true) {
            if (!nodeName) return undefined;
            return ListensEngine._deriveMethodName(nodeName, eventName);
        }
        if (typeof mapping === 'string') return mapping;
        if (typeof mapping === 'object') {
            if (mapping.handler === true) {
                if (!nodeName) return undefined;
                return ListensEngine._deriveMethodName(nodeName, eventName);
            }
            if (typeof mapping.handler === 'string') return mapping.handler;
        }
        return undefined;
    }

    /**
     * 从 EventMapping 中提取 ForwardConfig
     * 如果 mapping 是对象且包含转发字段，返回 ForwardConfig；否则返回 undefined
     */
    private static _extractForwardConfig(mapping: EventMapping): ForwardConfig | undefined {
        if (mapping === true || typeof mapping !== 'object') return undefined;
        const config: ForwardConfig = {};
        if (mapping.emits) config.emits = mapping.emits;
        if (mapping.bridges) config.bridges = mapping.bridges;
        if (mapping.entities) config.entities = mapping.entities;
        if (mapping.file) config.file = mapping.file;
        if (mapping.router) config.router = mapping.router;
        if (mapping.system) config.system = mapping.system;
        return Object.keys(config).length > 0 ? config : undefined;
    }

    /**
     * 推导方法名：on${PascalCase(nodeName)}${PascalCase(eventName)}
     */
    private static _deriveMethodName(nodeName: string, eventName: string): string {
        const pascalNode = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
        const pascalEvent = eventName.charAt(0).toUpperCase() + eventName.slice(1);
        return `on${pascalNode}${pascalEvent}`;
    }

    /**
     * 判断 once 选项
     */
    private static _isOnce(mapping: EventMapping): boolean {
        return mapping !== true && typeof mapping === 'object' && mapping.once === true;
    }

    // ─── 各类型绑定实现 ───

    private static _bindNode(
        instance: any,
        nodeName: string,
        events: Record<string, EventMapping>
    ): void {
        const child = instance.nodeMap?.[nodeName]?.component ?? instance.nodeMap?.[nodeName];
        if (!child || typeof child.on !== 'function') {
            console.warn(`ListensEngine: nodeMap["${nodeName}"] not found or not a component`);
            return;
        }

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping, nodeName);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                let called = false;
                const onceHandler = (...args: any[]) => {
                    if (called) return;
                    called = true;
                    child.off(eventName, onceHandler);
                    return handler(...args);
                };
                child.on(eventName, onceHandler);
                instance.onCleanup(() => child.off(eventName, onceHandler));
            } else {
                child.on(eventName, handler);
                instance.onCleanup(() => child.off(eventName, handler));
            }
        }
    }

    private static _bindComponent(
        instance: any,
        source: string,
        events: Record<string, EventMapping>
    ): void {
        const eventKey = EventForwarder.resolveKey(instance.eventKey);
        if (!eventKey) return;

        const bus = ComponentEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                bus.componentOnce(source, eventName, handler);
            } else {
                const off = bus.componentOn(source, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _bindEntity(instance: any, events: Record<string, EventMapping>): void {
        const entityKey = EventForwarder.resolveKey(instance.entityKey);
        if (!entityKey) return;

        const bus = EntityEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                bus.entityOnce(entityKey, eventName, handler);
            } else {
                const off = bus.entityOn(entityKey, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _bindSystem(instance: any, events: Record<string, EventMapping>): void {
        const bus = SystemEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                bus.once(eventName, handler);
            } else {
                const off = bus.on(eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _bindRoute(
        instance: any,
        route: string,
        events: Record<string, EventMapping>
    ): void {
        const bus = RouteEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                bus.routeOnce(route, eventName, handler);
            } else {
                const off = bus.routeOn(route, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _bindFile(
        instance: any,
        fileKey: string,
        events: Record<string, EventMapping>
    ): void {
        const bus = FileEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._createHandler(instance, eventName, mapping);
            const once = ListensEngine._isOnce(mapping);

            if (once) {
                bus.fileOnce(fileKey, eventName, handler);
            } else {
                const off = bus.fileOn(fileKey, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }
}
