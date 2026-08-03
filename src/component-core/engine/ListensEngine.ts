/**
 * ListensEngine — 外部事件订阅引擎
 *
 * 事件体系 ③：组件/实体/系统/路由/文件事件订阅
 *
 * Pipeline FINALIZE 阶段最先执行（bindListens），
 * 因为这些订阅不依赖子组件实例，越早订阅越早能收到事件。
 *
 * 五路分流：
 *   - source → ComponentEventBus.componentOn(eventKey, source, events)
 *   - entity → EntityEventBus.entityOn(entityKey, entity, events)
 *   - system → SystemEventBus.on(events)
 *   - route  → RouteEventBus.on(route, events)
 *   - file   → FileEventBus.fileOn(fileKey, action, handler)
 *
 * 解绑通过 instance.onCleanup() 自动完成。
 */

import type {
    ListenItem,
    EventMapping,
    ComponentListen,
    EntityListen,
    SystemListen,
    RouteListen,
    FileListen,
} from '../types/tpl-node-types';
import { EventForwarder } from './EventForwarder';
import { ComponentEventBus } from '@/events/ComponentEventBus';
import { EntityEventBus } from '@/events/EntityEventBus';
import { SystemEventBus } from '@/events/SystemEventBus';
import { RouteEventBus } from '@/events/RouteEventBus';
import { FileEventBus } from '@/events/FileEventBus';

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
     * 为组件实例绑定 listens 声明的外部事件订阅
     */
    static bindListens(instance: any, listens: ListenItem[]): void {
        if (!listens?.length) return;

        for (const item of listens) {
            if (isComponentListen(item)) {
                ListensEngine._bindComponent(instance, item.source, item.events);
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

    private static _bindComponent(
        instance: any,
        source: string,
        events: Record<string, EventMapping>
    ): void {
        const eventKey = EventForwarder.resolveKey(instance.eventKey);
        if (!eventKey) return;

        const bus = ComponentEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                bus.componentOnce(source, eventName, handler);
            } else {
                const off = bus.componentOn(source, eventName, handler);
                instance.onCleanup(off);
            }
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

        const bus = EntityEventBus.getInstance();

        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

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
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

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
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

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
            const handler = ListensEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;

            if (once) {
                bus.fileOnce(fileKey, eventName, handler);
            } else {
                const off = bus.fileOn(fileKey, eventName, handler);
                instance.onCleanup(off);
            }
        }
    }
}