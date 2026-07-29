/**
 * ListensEngine — 外部事件订阅引擎
 *
 * 事件体系 ③：桥接/实体/系统/路由事件订阅
 *
 * Pipeline FINALIZE 阶段最先执行（bindListens），
 * 因为这些订阅不依赖子组件实例，越早订阅越早能收到事件。
 *
 * 订阅来源：body.listens（ListenItem[]）
 * 四路分流：
 *   - source → EventBridge.on(bridgeKey, source, events)
 *   - entity → EntityEventBus.on(entityKey, entity, events)
 *   - system → SystemEventBus.on(events)
 *   - route  → RouteEventBus.on(route, events)
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 */

import type { ListenItem, EventMapping, BridgeListen, EntityListen, SystemListen, RouteListen } from '../types/tpl-body';

function isBridgeListen(item: ListenItem): item is BridgeListen { return 'source' in item; }
function isEntityListen(item: ListenItem): item is EntityListen { return 'entity' in item; }
function isSystemListen(item: ListenItem): item is SystemListen { return 'system' in item; }
function isRouteListen(item: ListenItem): item is RouteListen { return 'route' in item; }

export class ListensEngine {
    /**
     * 为组件实例绑定 listens 声明的外部事件订阅
     *
     * @param instance - 组件实例
     * @param listens - listens 声明数组
     */
    static bindListens(instance: any, listens: ListenItem[]): void {
        if (!listens?.length) return;

        const offFns: (() => void)[] = [];

        for (const item of listens) {
            if (isBridgeListen(item)) {
                const offs = ListensEngine._bindBridge(instance, item.source, item.events);
                offFns.push(...offs);
            } else if (isEntityListen(item)) {
                const offs = ListensEngine._bindEntity(instance, item.entity, item.events);
                offFns.push(...offs);
            } else if (isSystemListen(item)) {
                const offs = ListensEngine._bindSystem(instance, item.events);
                offFns.push(...offs);
            } else if (isRouteListen(item)) {
                const offs = ListensEngine._bindRoute(instance, item.route, item.events);
                offFns.push(...offs);
            }
        }

        instance._listensOffs = offFns;
    }

    /**
     * 解绑所有 listens 订阅（dispose 时调用）
     */
    static unbindListens(instance: any): void {
        const offFns: (() => void)[] = instance._listensOffs;
        if (!offFns?.length) return;
        for (const off of offFns) off();
        instance._listensOffs = [];
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
    ): (() => void)[] {
        const bridgeKey = ListensEngine._resolveKey(instance.bridgeKey);
        if (!bridgeKey) return [];

        const offs: (() => void)[] = [];
        const eventBridge = ListensEngine._getEventBridge(instance);
        if (!eventBridge) return [];

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                eventBridge.once(bridgeKey, source, eventName, handler);
            } else {
                eventBridge.on(bridgeKey, source, eventName, handler);
            }
            offs.push(() => eventBridge.off(bridgeKey, source, eventName, handler));
        }
        return offs;
    }

    private static _bindEntity(
        instance: any,
        entity: string,
        events: Record<string, EventMapping>
    ): (() => void)[] {
        const entityKey = ListensEngine._resolveKey(instance.entityKey);
        if (!entityKey) return [];

        const offs: (() => void)[] = [];
        const entityEventBus = ListensEngine._getEntityEventBus(instance);
        if (!entityEventBus) return [];

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                entityEventBus.once(entityKey, entity, eventName, handler);
            } else {
                entityEventBus.on(entityKey, entity, eventName, handler);
            }
            offs.push(() => entityEventBus.off(entityKey, entity, eventName, handler));
        }
        return offs;
    }

    private static _bindSystem(
        instance: any,
        events: Record<string, EventMapping>
    ): (() => void)[] {
        const offs: (() => void)[] = [];
        const systemEventBus = ListensEngine._getSystemEventBus(instance);
        if (!systemEventBus) return [];

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                systemEventBus.once(eventName, handler);
            } else {
                systemEventBus.on(eventName, handler);
            }
            offs.push(() => systemEventBus.off(eventName, handler));
        }
        return offs;
    }

    private static _bindRoute(
        instance: any,
        route: string,
        events: Record<string, EventMapping>
    ): (() => void)[] {
        const offs: (() => void)[] = [];
        const routeEventBus = ListensEngine._getRouteEventBus(instance);
        if (!routeEventBus) return [];

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                routeEventBus.once(route, eventName, handler);
            } else {
                routeEventBus.on(route, eventName, handler);
            }
            offs.push(() => routeEventBus.off(route, eventName, handler));
        }
        return offs;
    }

    private static _resolveKey(key: any): string | undefined {
        if (!key) return undefined;
        if (typeof key === 'string') return key;
        if (typeof key === 'object' && key.key) return key.key;
        return undefined;
    }

    private static _getEventBridge(instance: any): any {
        if (typeof instance.getEventBridge === 'function') return instance.getEventBridge();
        try { return require('@/events/EventBridge').eventBridge; } catch { return null; }
    }

    private static _getEntityEventBus(instance: any): any {
        if (typeof instance.getEntityEventBus === 'function') return instance.getEntityEventBus();
        try { return require('@/events/EntityEventBus').entityEventBus; } catch { return null; }
    }

    private static _getSystemEventBus(instance: any): any {
        if (typeof instance.getSystemEventBus === 'function') return instance.getSystemEventBus();
        try { return require('@/events/SystemEventBus').systemEventBus; } catch { return null; }
    }

    private static _getRouteEventBus(instance: any): any {
        if (typeof instance.getRouteEventBus === 'function') return instance.getRouteEventBus();
        try { return require('@/events/RouteEventBus').routeEventBus; } catch { return null; }
    }
}