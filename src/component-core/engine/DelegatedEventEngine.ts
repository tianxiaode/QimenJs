/**
 * DelegatedEventEngine — 委托事件引擎
 *
 * 纯函数引擎：编译 tplEvents 为运行时元数据 + 运行时委托绑定/分发
 *
 * 编译时：compileTplEvents(tplEvents) → DelegatedEventRule[]
 * 运行时：bindDelegatedEvents(instance) → 根 el 委托 + 少量内部绑定
 *         handleDelegatedEvent(instance, event, rules, nodeElMap) → 分发
 */

import type {
    TplEvents,
    NodeEventDecl,
    TplEventAction,
    DelegatedEventRule,
} from '../types/tpl-events';
import type { DomEventDecl } from '../types/tpl-node-types';
import type { NodeMetadata } from '../types/compiled-types';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';

type EventDataType = 'emit' | 'bridge' | 'entity' | 'float';

export interface ChildEventEntry {
    nodeName: string;
    el: Element;
    rules: DelegatedEventRule[];
}

export class DelegatedEventEngine {
    static compileTplEvents(tplEvents: TplEvents): DelegatedEventRule[] {
        const rules: DelegatedEventRule[] = [];

        for (const [nodeName, decl] of Object.entries(tplEvents)) {
            if (Array.isArray(decl)) {
                for (const event of decl) {
                    rules.push({
                        nodeName,
                        event,
                        needsBinding: false,
                    });
                }
            } else {
                for (const [event, action] of Object.entries(decl)) {
                    const handler = DelegatedEventEngine._resolveHandlerName(
                        nodeName,
                        event,
                        action.handler
                    );
                    const emits = action.emits === true ? [nodeName] : action.emits;
                    const bridges = action.bridges === true ? [nodeName] : action.bridges;
                    const entities = action.entities === true ? nodeName : action.entities;
                    const needsBinding = !!(
                        handler ||
                        emits?.length ||
                        bridges?.length ||
                        entities
                    );
                    rules.push({
                        nodeName,
                        event,
                        handler,
                        emits,
                        bridges,
                        entities,
                        once: action.once,
                        debounce: action.debounce,
                        throttle: action.throttle,
                        needsBinding,
                    });
                }
            }
        }

        return rules;
    }

    static buildChildEventIndex(instance: any): ChildEventEntry[] {
        const index: ChildEventEntry[] = [];
        if (!instance.nodeMap) return index;

        for (const [nodeName, node] of Object.entries(
            instance.nodeMap as Record<string, NodeMetadata>
        )) {
            if (!node.component) continue;
            index.push({
                nodeName,
                el: node.component.el,
            });
        }

        return index;
    }

    static buildNodeElMap(instance: any): WeakMap<Element, string> {
        const map = new WeakMap<Element, string>();
        if (!instance.nodeMap) return map;

        for (const [nodeName, node] of Object.entries(instance.nodeMap as Record<string, any>)) {
            const el = node.component ? node.component.el : node.el;
            if (el) map.set(el, nodeName);
        }

        return map;
    }

    static bindDelegatedEvents(instance: any): void {
        const rules: DelegatedEventRule[] = instance.constructor._delegatedEventRules;
        if (!rules || rules.length === 0) return;

        const nodeElMap = DelegatedEventEngine.buildNodeElMap(instance);
        instance._nodeElMap = nodeElMap;

        const childEventIndex = DelegatedEventEngine.buildChildEventIndex(instance);
        instance._childEventIndex = childEventIndex;

        const allEventTypes = new Set<string>();
        for (const rule of rules) {
            if (rule.needsBinding) {
                allEventTypes.add(rule.event);
            }
        }
        for (const child of childEventIndex) {
            for (const rule of child.rules) {
                allEventTypes.add(rule.event);
            }
        }

        for (const eventType of allEventTypes) {
            const useCapture = eventType === 'focus' || eventType === 'blur';

            instance.bind(instance.el, eventType as any, {
                capture: useCapture,
                delegated: true,
            });

            const domEventKey = `${DOM_EVENT_PREFIX}${eventType}`;
            instance.on(domEventKey, (domEvt: any) => {
                DelegatedEventEngine.handleDelegatedEvent(
                    instance,
                    domEvt,
                    rules,
                    nodeElMap,
                    childEventIndex
                );
            });
        }

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            const node = instance.nodeMap?.[rule.nodeName];
            if (!node) continue;

            const el = node.component ? node.component.el : node.el;
            if (!el) continue;

            const bindOptions: any = {};
            if (rule.debounce && rule.debounce > 0) bindOptions.debounce = rule.debounce;
            if (rule.throttle && rule.throttle > 0) bindOptions.throttle = rule.throttle;

            instance.bind(el, rule.event as any, bindOptions);

            const domEventKey = `${DOM_EVENT_PREFIX}${rule.event}`;
            const callback = (domEvt: any) => {
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            };

            if (rule.once) {
                instance.once(domEventKey, callback);
            } else {
                instance.on(domEventKey, callback);
            }
        }
    }

    static handleDelegatedEvent(
        instance: any,
        domEvt: any,
        rules: DelegatedEventRule[],
        nodeElMap: WeakMap<Element, string>,
        childEventIndex: ChildEventEntry[]
    ): void {
        const target = domEvt?.target as Element;
        if (!target) return;

        const eventType = domEvt?.type as string;

        for (const child of childEventIndex) {
            if (!child.el.contains(target)) continue;

            const matchingRules = rules.filter(
                r => r.nodeName === child.nodeName && r.event === eventType
            );
            for (const rule of matchingRules) {
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            }
            return;
        }

        let el: Element | null = target;
        while (el && el !== instance.el) {
            const nodeName = nodeElMap.get(el);
            if (nodeName) {
                const matchingRules = rules.filter(r => r.nodeName === nodeName && !r.needsBinding);
                for (const rule of matchingRules) {
                    DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
                }
            }
            el = el.parentElement;
        }
    }

    static _dispatchRule(instance: any, rule: DelegatedEventRule, domEvt: any): void {
        const node = instance.nodeMap?.[rule.nodeName];
        if (!node) return;

        const el = node.component ? node.component.el : node.el;

        if (rule.handler && typeof instance[rule.handler] === 'function') {
            instance[rule.handler](domEvt, el);
        }

        if (rule.emits?.length) {
            for (const emitName of rule.emits) {
                const eventData = DelegatedEventEngine._collectEventData(
                    instance,
                    rule.nodeName,
                    emitName,
                    'emit'
                );
                const payload = mergeEventData(eventData, undefined);
                const ctx = DelegatedEventEngine._buildForwardContext(
                    instance,
                    emitName,
                    payload,
                    instance.eventKey ?? '',
                    'emit'
                );
                if (domEvt) {
                    (ctx as any).domEvent = domEvt;
                }
                instance.emit(emitName, ctx);
            }
        }

        if (rule.bridges?.length && instance.eventKey) {
            for (const bridge of rule.bridges) {
                const bridgeData = DelegatedEventEngine._collectEventData(
                    instance,
                    rule.nodeName,
                    bridge,
                    'bridge'
                );
                const payload = mergeEventData(bridgeData, undefined);
                const ctx = DelegatedEventEngine._buildForwardContext(
                    instance,
                    bridge,
                    payload,
                    instance.eventKey,
                    'bridge'
                );
                instance.bridgeEmit(ctx);
            }
        }

        if (rule.entities && instance.entityKey) {
            const entityData = DelegatedEventEngine._collectEventData(
                instance,
                rule.nodeName,
                rule.event,
                'entity'
            );
            const payload = mergeEventData(entityData, undefined);
            const ctx = DelegatedEventEngine._buildForwardContext(
                instance,
                rule.entities,
                payload,
                instance.entityKey,
                'entity'
            );
            instance.entityEmit(ctx);
        }
    }

    static _resolveHandlerName(
        nodeName: string,
        domEvent: string,
        handler?: boolean | string
    ): string | undefined {
        if (handler === true) {
            const capitalEvent = domEvent.charAt(0).toUpperCase() + domEvent.slice(1);
            const capitalKey = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
            return nodeName ? `on${capitalKey}${capitalEvent}` : `on${capitalEvent}`;
        }
        if (typeof handler === 'string') return handler;
        return undefined;
    }

    static _collectEventData(
        instance: any,
        nodeName: string,
        eventName: string,
        eventType: EventDataType
    ): Record<string, any> | undefined {
        if (typeof instance.getEventData === 'function') {
            return instance.getEventData(nodeName, eventName, eventType);
        }
        return undefined;
    }

    static _buildForwardContext(
        instance: any,
        eventName: string,
        data: any,
        source: string,
        eventType: EventDataType
    ): EventContext {
        const currentCtx = instance._currentEventContext as EventContext | undefined;
        const chain: EventChainLink[] | undefined = currentCtx
            ? [
                  ...(currentCtx.chain || []),
                  {
                      event: currentCtx.event,
                      type: currentCtx.type!,
                      source: currentCtx.source,
                      sourceType: currentCtx.sourceType!,
                  },
              ]
            : undefined;

        const clonedData = data !== undefined ? object.clone(data) : undefined;

        return EventContextBuilder.create()
            .withEvent(eventName)
            .withType(eventName)
            .withSource(source)
            .withSourceType(instance.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withChain(chain)
            .build();
    }
}

function mergeEventData(eventData: Record<string, any> | undefined, data: any): any {
    if (eventData === undefined) return data;
    if (data === undefined) return eventData;
    if (typeof data === 'object' && typeof eventData === 'object') {
        return { ...eventData, ...data };
    }
    return data;
}
