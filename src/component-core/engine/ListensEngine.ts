/**
 * ListensEngine — 外部事件订阅引擎
 *
 * 事件体系 ③：桥接/实体/系统/路由/文件事件订阅
 *
 * Pipeline FINALIZE 阶段最先执行（bindListens），
 * 因为这些订阅不依赖子组件实例，越早订阅越早能收到事件。
 *
 * 五路分流：
 *   - source → EventBridge.on(bridgeKey, source, events)
 *   - entity → EntityEventBus.on(entityKey, entity, events)
 *   - system → SystemEventBus.on(events)
 *   - route  → RouteEventBus.on(route, events)
 *   - file   → FileEventBus.fileOn(fileKey, action, handler)
 *
 * 解绑通过 instance.onCleanup() 自动完成。
 */

import type {
    ListenItem,
    EventMapping,
    BridgeListen,
    EntityListen,
    SystemListen,
    RouteListen,
    FileListen,
} from '../types/tpl-node-types';
import { EventForwarder } from './EventForwarder';

function isBridgeListen(item: ListenItem): item is BridgeListen {
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
     * 为组件实例绑定 listens 声明的外部事件订阅
     */
    static bindListens(instance: any, listens: ListenItem[]): void {
        if (!listens?.length) return;

        for (const item of listens) {
            if (isBridgeListen(item)) {
                ListensEngine._bindBridge(instance, item.source, item.events);
            } else if (isEntityListen(item)) {
                ListensEngine._bindEntity(instance, item.entity, item.events);
            } else if (isSystemListen(item)) {
                ListensEngine._bindSystem(instance, item.events);
            } else if (isRouteListen(item)) {
                ListensEngine._bindRoute(instance, item.route, item.events);
            } else if (isFileListen(item)) {
                ListensEngine._bindFile(instance, item.file, item.events);
            }
        }
    }

    private static _resolveHandler(instance: any, mapping: EventMapping): (...args: any[]) => void {
        const methodName = typeof mapping === 'string' ? mapping : mapping.handler;
        const method = instance[methodName];
        if (typeof method !== 'function') {
            console.warn(`ListensEngine: method "${methodName}" not found on component`);
            return () => {};
        }
        return method.bind(instance);
    }

    private static _bindBridge(
        instance: any,
        source: string,
        events: Record<string, EventMapping>
    ): void {
        const bridgeKey = EventForwarder.resolveKey(instance.bridgeKey);
        if (!bridgeKey) return;

        const eventBridge = ListensEngine._getEventBridge(instance);
        if (!eventBridge) return;

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                eventBridge.once(bridgeKey, source, eventName, handler);
            } else {
                eventBridge.on(bridgeKey, source, eventName, handler);
            }
            instance.onCleanup(() => eventBridge.off(bridgeKey, source, eventName, handler));
        }
    }

    private static _bindEntity(
        instance: any,
        _entity: true,
        events: Record<string, EventMapping>
    ): void {
        // entityKey 从 instance.entityKey 取（独立于 listens 声明，无需重复）
        const entityKey = EventForwarder.resolveKey(instance.entityKey);
        if (!entityKey) return;

        const entityEventBus = ListensEngine._getEntityEventBus(instance);
        if (!entityEventBus) return;

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                entityEventBus.entityOnce(entityKey, eventName, handler);
            } else {
                const off = entityEventBus.entityOn(entityKey, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _bindSystem(instance: any, events: Record<string, EventMapping>): void {
        const systemEventBus = ListensEngine._getSystemEventBus(instance);
        if (!systemEventBus) return;

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                systemEventBus.once(eventName, handler);
            } else {
                systemEventBus.on(eventName, handler);
            }
            instance.onCleanup(() => systemEventBus.off(eventName, handler));
        }
    }

    private static _bindRoute(
        instance: any,
        route: string,
        events: Record<string, EventMapping>
    ): void {
        const routeEventBus = ListensEngine._getRouteEventBus(instance);
        if (!routeEventBus) return;

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                routeEventBus.once(route, eventName, handler);
            } else {
                routeEventBus.on(route, eventName, handler);
            }
            instance.onCleanup(() => routeEventBus.off(route, eventName, handler));
        }
    }

    private static _bindFile(
        instance: any,
        fileKey: string,
        events: Record<string, EventMapping>
    ): void {
        const fileEventBus = ListensEngine._getFileEventBus(instance);
        if (!fileEventBus) return;

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                fileEventBus.fileOnce(fileKey, eventName, handler);
            } else {
                const off = fileEventBus.fileOn(fileKey, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }

    private static _getEventBridge(instance: any): any {
        if (typeof instance.getEventBridge === 'function') return instance.getEventBridge();
        try {
            return require('@/events/EventBridge').eventBridge;
        } catch {
            return null;
        }
    }

    private static _getEntityEventBus(instance: any): any {
        if (typeof instance.getEntityEventBus === 'function') return instance.getEntityEventBus();
        try {
            return require('@/events/EntityEventBus').entityEventBus;
        } catch {
            return null;
        }
    }

    private static _getSystemEventBus(instance: any): any {
        if (typeof instance.getSystemEventBus === 'function') return instance.getSystemEventBus();
        try {
            return require('@/events/SystemEventBus').systemEventBus;
        } catch {
            return null;
        }
    }

    private static _getRouteEventBus(instance: any): any {
        if (typeof instance.getRouteEventBus === 'function') return instance.getRouteEventBus();
        try {
            return require('@/events/RouteEventBus').routeEventBus;
        } catch {
            return null;
        }
    }

    private static _getFileEventBus(instance: any): any {
        if (typeof instance.getFileEventBus === 'function') return instance.getFileEventBus();
        try {
            return require('@/events/FileEventBus').fileEventBus;
        } catch {
            return null;
        }
    }
}
