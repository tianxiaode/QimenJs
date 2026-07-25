/**
 * DelegatedEventEngine — 委托事件引擎
 *
 * 纯函数引擎：编译 tplEvents 为运行时元数据 + 运行时委托绑定/分发
 *
 * 编译时：compileTplEvents(tplEvents) → DelegatedEventRule[]
 * 运行时：bindDelegatedEvents(instance) → 根 el 委托 + 少量内部绑定
 *         handleDelegatedEvent(instance, event, rules) → 分发
 */

import type {
    TplEvents,
    NodeEventDecl,
    TplEventAction,
    ItemTypeEvents,
    DelegatedEventRule,
} from '../types/tpl-events';

import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';

type EventDataType = 'handler' | 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

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
                const { $items, ...eventDecls } = decl;

                for (const [event, action] of Object.entries(eventDecls)) {
                    const rule = DelegatedEventEngine._compileEventAction(nodeName, event, action);
                    if (rule) rules.push(rule);
                }

                if ($items) {
                    DelegatedEventEngine._compileItemEvents(rules, nodeName, $items);
                }
            }
        }

        return rules;
    }

    private static _compileEventAction(
        nodeName: string,
        event: string,
        action: TplEventAction
    ): DelegatedEventRule | null {
        const handler = DelegatedEventEngine._resolveHandlerName(nodeName, event, action.handler);
        const emits = action.emits;
        const bridges = action.bridges;
        const entities = action.entities;
        const router = action.router;
        const system = action.system
            ? Array.isArray(action.system)
                ? action.system
                : [action.system]
            : undefined;
        const needsBinding = !!(
            handler ||
            emits?.length ||
            bridges?.length ||
            entities ||
            router ||
            system?.length
        );
        return {
            nodeName,
            event,
            handler,
            emits,
            bridges,
            entities,
            router,
            system,
            keyProp: action.keyProp,
            data: action.data,
            once: action.once,
            debounce: action.debounce,
            throttle: action.throttle,
            needsBinding,
        };
    }

    private static _compileItemEvents(
        rules: DelegatedEventRule[],
        nodeName: string,
        itemTypeEvents: ItemTypeEvents
    ): void {
        for (const [itemType, eventDecls] of Object.entries(itemTypeEvents)) {
            for (const [event, action] of Object.entries(eventDecls)) {
                const rule = DelegatedEventEngine._compileEventAction(nodeName, event, action);
                if (rule) {
                    rule.itemType = itemType;
                    if (!rule.keyProp) rule.keyProp = 'name';
                    rules.push(rule);
                }
            }
        }
    }

    static bindDelegatedEvents(instance: any): void {
        const rules: DelegatedEventRule[] = instance.constructor._delegatedEventRules;
        if (!rules || rules.length === 0) return;

        const allEventTypes = new Set<string>();
        for (const rule of rules) {
            if (rule.needsBinding) {
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
                DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);
            });
        }

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            let el: any;
            if (rule.nodeName === '') {
                el = instance.el;
            } else {
                const node = instance.nodeMap?.[rule.nodeName];
                if (!node) continue;
                el = node.component ? node.component.el : node.el;
            }
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

    static handleDelegatedEvent(instance: any, domEvt: any, rules: DelegatedEventRule[]): void {
        const target = domEvt?.target as Element;
        if (!target) return;

        const eventType = domEvt?.type as string;
        let matchedNamedNode = false;

        for (const rule of rules) {
            if (rule.nodeName === '' || rule.event !== eventType) continue;

            if (rule.itemType) {
                if (!instance.containsElement(rule.nodeName, target)) continue;
                const node = instance.nodeMap?.[rule.nodeName];
                const container = node?.component || instance;
                if (typeof container.getTargetItem !== 'function') continue;
                const itemInfo = container.getTargetItem(target);
                if (!itemInfo || itemInfo.type !== rule.itemType) continue;
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
                matchedNamedNode = true;
            } else {
                if (instance.containsElement(rule.nodeName, target)) {
                    DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
                    matchedNamedNode = true;
                }
            }
        }

        if (!matchedNamedNode) {
            const rootRules = rules.filter(r => r.nodeName === '' && r.event === eventType);
            for (const rule of rootRules) {
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            }
        }
    }

    static _dispatchRule(
        instance: any,
        rule: DelegatedEventRule,
        domEvt: any,
        itemInfo?: any
    ): void {
        let el: any;
        if (rule.nodeName === '') {
            el = instance.el;
        } else {
            const node = instance.nodeMap?.[rule.nodeName];
            if (!node) return;
            el = node.component ? node.component.el : node.el;
        }

        const keyValue =
            rule.keyProp && itemInfo?.component ? itemInfo.component[rule.keyProp] : undefined;

        const itemPayload = keyValue ? { ...itemInfo, [rule.keyProp!]: keyValue } : itemInfo;

        const buildPayload = (eventType: EventDataType): any => {
            const fields = DelegatedEventEngine._resolveDataFields(rule.data, eventType);
            const extraData = fields
                ? DelegatedEventEngine._collectDataFields(instance, itemPayload, fields)
                : {};
            const eventData = DelegatedEventEngine._collectEventData(
                instance,
                rule.nodeName,
                rule.event,
                eventType
            );
            return mergeEventData(eventData, { ...itemPayload, ...extraData });
        };

        if (rule.handler) {
            let handlerName = rule.handler;
            if (keyValue) {
                handlerName = DelegatedEventEngine._resolveHandlerName(keyValue, rule.event, true)!;
            }
            if (typeof instance[handlerName] === 'function') {
                instance[handlerName](domEvt, el, buildPayload('handler'));
            }
        }

        if (rule.emits?.length) {
            const payload = buildPayload('emit');
            for (const emitName of rule.emits) {
                if (keyValue) {
                    const specificName =
                        keyValue + emitName.charAt(0).toUpperCase() + emitName.slice(1);
                    const specificCtx = DelegatedEventEngine._buildForwardContext(
                        instance,
                        specificName,
                        payload,
                        instance.eventKey ?? '',
                        'emit'
                    );
                    if (domEvt) (specificCtx as any).domEvent = domEvt;
                    instance.emit(specificName, specificCtx);
                }
                const ctx = DelegatedEventEngine._buildForwardContext(
                    instance,
                    emitName,
                    payload,
                    instance.eventKey ?? '',
                    'emit'
                );
                if (domEvt) (ctx as any).domEvent = domEvt;
                instance.emit(emitName, ctx);
            }
        }

        if (rule.bridges?.length && instance.eventKey) {
            const payload = buildPayload('bridge');
            for (const bridge of rule.bridges) {
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
            let entityName: string | undefined;
            if (typeof rule.entities === 'string' && rule.entities !== 'true') {
                entityName = rule.entities;
            }
            if (keyValue) entityName = keyValue;
            if (!entityName) return;
            const payload = buildPayload('entity');
            const ctx = DelegatedEventEngine._buildForwardContext(
                instance,
                entityName,
                payload,
                instance.entityKey,
                'entity'
            );
            instance.entityEmit(ctx);
        }

        if (rule.router && instance.routeKey) {
            let routeName: string | undefined;
            if (typeof rule.router === 'string' && rule.router !== 'true') {
                routeName = rule.router;
            }
            if (keyValue) routeName = keyValue;
            if (!routeName) return;
            const payload = buildPayload('router');
            const ctx = DelegatedEventEngine._buildForwardContext(
                instance,
                routeName,
                payload,
                instance.routeKey,
                'router'
            );
            instance.routerEmit?.(ctx);
        }

        if (rule.system?.length) {
            const payload = buildPayload('system');
            for (const sysEvent of rule.system) {
                const ctx = DelegatedEventEngine._buildForwardContext(
                    instance,
                    sysEvent,
                    payload,
                    instance.constructor.name,
                    'system'
                );
                instance.systemEmit?.(ctx);
            }
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

    private static _resolveDataFields(
        dataDecl: string[] | Record<string, string[]> | undefined,
        eventType: string
    ): string[] | undefined {
        if (!dataDecl) return undefined;
        if (Array.isArray(dataDecl)) return dataDecl;
        return dataDecl[eventType];
    }

    private static _collectDataFields(
        instance: any,
        itemPayload: any,
        fields: string[]
    ): Record<string, any> {
        const result: Record<string, any> = {};
        for (const field of fields) {
            if (
                field.startsWith('get') &&
                field.length > 3 &&
                typeof instance[field] === 'function'
            ) {
                Object.assign(result, instance[field]());
            } else if (itemPayload?.component && field in itemPayload.component) {
                result[field] = itemPayload.component[field];
            } else if (itemPayload && field in itemPayload) {
                result[field] = itemPayload[field];
            }
        }
        return result;
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
