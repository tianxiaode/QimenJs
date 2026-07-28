/**
 * DelegatedEventEngine — 委托事件引擎
 *
 * 纯函数引擎：编译节点级事件声明 + 运行时委托绑定/分发
 *
 * 事件声明来源：TplNode.emits / action / data（节点级，内联在模板上）
 *   → CompileEngine → NodeMetadata.emits/action/data
 *   → compileNodeEmits → DelegatedEventRule[]
 *
 * 运行时分发流程：
 *   1. Pipeline 中 bindNodeEventMeta 步骤：
 *      - 为节点 el 设置 NODE_EVENT_META = { nodeName, eventTypes, action?, data? }
 *      - 为组件 el 设置 COMPONENT_ROOT 标记（边界保护）
 *   2. 事件委托触发时 handleDelegatedEvent：
 *      - 从 event.target 向上遍历 parentElement
 *      - 查找最近的 NODE_EVENT_META（匹配 eventType）
 *      - 碰到 COMPONENT_ROOT 停止（防止越界）
 *      - 找到匹配 → 合并事件数据 → 执行 emit
 *
 * @module DelegatedEventEngine
 */

import type { DelegatedEventRule } from '../types/tpl-events';
import type { NodeMetadata } from '../types/compiled-types';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';
import { NODE_EVENT_META, COMPONENT_ROOT } from '../constants/event-constants';

type EventDataType = 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

export class DelegatedEventEngine {
    /**
     * 编译节点级事件声明 — 从 NodeMetadata.emits/action/data 生成 DelegatedEventRule[]
     *
     * @param nodeMetas - 节点元数据映射
     * @returns 委托规则数组
     *
     * @example
     * ```ts
     * // NodeMetadata: { saveBtn: { emits: { click: 'saveClick' }, action: 'save', data: ['name'] } }
     * const rules = DelegatedEventEngine.compileNodeEmits(nodeMetas);
     * // 返回: [{ nodeName: 'saveBtn', event: 'click', emits: ['saveClick'], action: 'save', data: ['name'], needsBinding: true }]
     * ```
     */
    static compileNodeEmits(nodeMetas: Record<string, NodeMetadata>): DelegatedEventRule[] {
        const rules: DelegatedEventRule[] = [];

        for (const [nodeName, meta] of Object.entries(nodeMetas)) {
            if (nodeName === 'root') continue;

            const emits = meta.emits;
            if (!emits) continue;

            for (const [domEvent, componentEvent] of Object.entries(emits)) {
                const rule: DelegatedEventRule = {
                    nodeName,
                    event: domEvent,
                    emits: [componentEvent],
                    action: meta.action,
                    data: meta.data,
                    needsBinding: true,
                };
                rules.push(rule);
            }
        }

        return rules;
    }

    /**
     * 为组件实例绑定委托事件
     *
     * 只处理节点级事件（NODE_EVENT_META），将所有需要绑定的事件类型统一委托到根元素。
     *
     * @param instance - 组件实例
     */
    static bindDelegatedEvents(instance: any): void {
        const ctor = instance.constructor;
        const rules: DelegatedEventRule[] = ctor._nodeEventRules || [];

        if (!rules.length) return;

        const allEventTypes = new Set<string>();
        for (const rule of rules) {
            if (rule.needsBinding) {
                allEventTypes.add(rule.event);
            }
        }

        const dispatchers = new Map<string, (...args: any[]) => void>();

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            const key = DelegatedEventEngine._ruleKey(rule);
            const baseDispatch = (domEvt: any) => {
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
            };

            let wrapped: (...args: any[]) => void = baseDispatch;

            if (rule.debounce && rule.debounce > 0) {
                wrapped = debounce(wrapped, rule.debounce);
            } else if (rule.throttle && rule.throttle > 0) {
                wrapped = throttle(wrapped, rule.throttle);
            }

            if (rule.once) {
                let called = false;
                const original = wrapped;
                wrapped = (...args: any[]) => {
                    if (called) return;
                    called = true;
                    return original(...args);
                };
            }

            dispatchers.set(key, wrapped);
        }

        (instance as any)._delegatedDispatchers = dispatchers;

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
    }

    private static _ruleKey(rule: DelegatedEventRule): string {
        return `${rule.nodeName}::${rule.event}`;
    }

    /**
     * 处理委托事件分发
     *
     * 从 event.target 向上遍历，查找 NODE_EVENT_META，
     * 碰到 COMPONENT_ROOT 停止。
     *
     * @param instance - 组件实例
     * @param domEvt - 原生 DOM 事件对象
     * @param rules - 委托规则数组
     */
    static handleDelegatedEvent(instance: any, domEvt: any, rules: DelegatedEventRule[]): void {
        const target = domEvt?.target as Element;
        if (!target) return;

        const eventType = domEvt?.type as string;
        if (!eventType) return;

        const dispatchers: Map<string, (...args: any[]) => void> | undefined = (instance as any)
            ._delegatedDispatchers;

        let current: Element | null = target;

        while (current) {
            const eventMeta = (current as any)[NODE_EVENT_META];

            if (eventMeta && eventMeta.eventTypes.has(eventType)) {
                const rule = rules.find(
                    r => r.nodeName === eventMeta.nodeName && r.event === eventType
                );

                if (rule) {
                    const dispatch = dispatchers?.get(DelegatedEventEngine._ruleKey(rule));
                    if (dispatch) {
                        dispatch(domEvt);
                    } else {
                        DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
                    }
                    return;
                }
            }

            if ((current as any)[COMPONENT_ROOT]) break;

            current = current.parentElement;
        }
    }

    /**
     * 分发单个事件规则
     *
     * 构建事件上下文并执行 emit。
     * 事件数据合并：action + data
     *
     * @param instance - 组件实例
     * @param rule - 委托规则
     * @param domEvt - 原生 DOM 事件对象
     */
    static _dispatchRule(instance: any, rule: DelegatedEventRule, domEvt: any): void {
        const node = instance.nodeMap?.[rule.nodeName];
        if (!node && rule.nodeName !== '') return;
        const el =
            rule.nodeName === '' ? instance.el : node?.component ? node.component.el : node?.el;

        const buildPayload = (eventType: EventDataType): any => {
            const fields = DelegatedEventEngine._resolveDataFields(rule.data, eventType);
            const extraData = fields
                ? DelegatedEventEngine._collectDataFields(instance, fields)
                : {};

            const actionData = rule.action ? { action: rule.action } : {};

            const eventData = DelegatedEventEngine._collectEventData(
                instance,
                rule.nodeName,
                rule.event,
                eventType
            );

            return mergeEventData(eventData, { ...actionData, ...extraData });
        };

        if (rule.emits?.length) {
            const payload = buildPayload('emit');
            for (const emitName of rule.emits) {
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
            if (typeof rule.entities === 'string') {
                entityName = rule.entities;
            }
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
            if (typeof rule.router === 'string') {
                routeName = rule.router;
            }
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

    /**
     * 解析数据字段声明
     */
    private static _resolveDataFields(
        dataDecl: string[] | Record<string, string[]> | undefined,
        eventType: string
    ): string[] | undefined {
        if (!dataDecl) return undefined;
        if (Array.isArray(dataDecl)) return dataDecl;
        return dataDecl[eventType];
    }

    /**
     * 收集数据字段值
     *
     * 从组件实例收集指定字段的值。
     * 支持 getXxx 方法调用和直接属性访问。
     */
    private static _collectDataFields(instance: any, fields: string[]): Record<string, any> {
        const result: Record<string, any> = {};
        for (const field of fields) {
            if (
                field.startsWith('get') &&
                field.length > 3 &&
                typeof instance[field] === 'function'
            ) {
                Object.assign(result, instance[field]());
            } else if (field in instance) {
                result[field] = instance[field];
            }
        }
        return result;
    }

    /**
     * 收集事件数据
     */
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

    /**
     * 构建转发事件上下文
     */
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
