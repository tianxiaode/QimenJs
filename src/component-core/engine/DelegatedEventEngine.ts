/**
 * DelegatedEventEngine — 委托事件引擎
 *
 * 纯函数引擎：编译事件声明为运行时元数据 + 运行时委托绑定/分发
 *
 * 两种事件声明来源：
 *   1. 节点级（新方案）：TplNode.emits/action → NodeMetadata.emits/action
 *      → compileNodeEmits → DelegatedEventRule[]
 *   2. 组件级（旧方案）：TplEvents → compileTplEvents → DelegatedEventRule[]
 *
 * 运行时分发流程：
 *   1. Pipeline 中 bindNodeEventMeta 步骤：
 *      - 为节点 el 设置 NODE_EVENT_META = { nodeName, eventTypes, action? }
 *      - 为组件 el 设置 COMPONENT_ROOT 标记（边界保护）
 *   2. 事件委托触发时 handleDelegatedEvent：
 *      - 优先使用节点级匹配：从 event.target 向上遍历 parentElement
 *      - 查找最近的 NODE_EVENT_META（匹配 eventType）
 *      - 碰到 COMPONENT_ROOT 停止（防止越界）
 *      - 找到匹配 → 合并事件数据 → 执行 emit
 *      - 未找到则回退到旧方案的 containsElement 匹配
 *
 * @module DelegatedEventEngine
 */

import type {
    TplEvents,
    NodeEventDecl,
    TplEventAction,
    ItemTypeEvents,
    DelegatedEventRule,
} from '../types/tpl-events';

import type { NodeMetadata } from '../types/compiled-types';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { NODE_EVENT_META, COMPONENT_ROOT } from '../constants/event-constants';

type EventDataType = 'handler' | 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

export class DelegatedEventEngine {
    /**
     * 编译节点级事件声明 — 从 NodeMetadata.emits/action 生成 DelegatedEventRule[]
     *
     * 新方案：直接从编译产物 NodeMetadata 中提取 emits 和 action，
     * 生成可执行的委托规则数组。
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
     * 编译模板事件声明为委托规则（旧方案，仍支持）
     *
     * 将模板中定义的事件声明编译为运行时可执行的委托规则数组。
     * 支持普通节点事件、列表项事件（$items）等多种事件类型。
     *
     * @param tplEvents - 模板事件声明对象，key 为节点名称，value 为事件配置
     * @returns 委托规则数组，包含所有编译后的事件处理规则
     */
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

    /**
     * 编译单个事件动作
     *
     * 将单个事件的动作配置编译为委托规则对象。
     * 处理 handler、emits、bridges、entities、router、system 等多种动作类型。
     *
     * @param nodeName - 节点名称
     * @param event - DOM 事件名
     * @param action - 事件动作配置
     * @returns 编译后的委托规则
     */
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
            action: (action as any).action,
            once: action.once,
            debounce: action.debounce,
            throttle: action.throttle,
            needsBinding,
        };
    }

    /**
     * 编译列表项事件
     *
     * 处理 $items 声明中的列表项事件，为每个 item 类型生成对应的事件规则。
     * 会自动合并组件注册表中定义的默认事件数据。
     *
     * @param rules - 规则数组
     * @param nodeName - 列表容器节点名称
     * @param itemTypeEvents - item 类型到事件声明的映射
     */
    private static _compileItemEvents(
        rules: DelegatedEventRule[],
        nodeName: string,
        itemTypeEvents: ItemTypeEvents
    ): void {
        const registrar = ComponentRegistrar.getInstance();

        for (const [itemType, eventDecls] of Object.entries(itemTypeEvents)) {
            const defaultEventData = registrar.getMeta(itemType)?.defaultEventData;

            for (const [event, action] of Object.entries(eventDecls)) {
                const rule = DelegatedEventEngine._compileEventAction(nodeName, event, action);
                if (rule) {
                    rule.itemType = itemType;
                    if (!rule.keyProp) rule.keyProp = 'name';

                    if (defaultEventData?.length) {
                        rule.data = DelegatedEventEngine._mergeData(defaultEventData, rule.data);
                    }

                    rules.push(rule);
                }
            }
        }
    }

    /**
     * 合并事件数据字段
     *
     * @param base - 基础数据字段数组
     * @param extra - 额外数据字段
     * @returns 合并后的数据字段
     */
    private static _mergeData(
        base: string[],
        extra: string[] | Record<string, string[]> | undefined
    ): string[] | Record<string, string[]> | undefined {
        if (!extra) return base.length ? base : undefined;

        if (Array.isArray(extra)) {
            const merged = [...base];
            for (const field of extra) {
                if (!merged.includes(field)) merged.push(field);
            }
            return merged;
        }

        if (typeof extra === 'object') {
            const result: Record<string, string[]> = {};
            for (const [key, fields] of Object.entries(extra)) {
                const merged = [...base];
                for (const field of fields) {
                    if (!merged.includes(field)) merged.push(field);
                }
                result[key] = merged;
            }
            return result;
        }

        return extra;
    }

    /**
     * 为组件实例绑定委托事件
     *
     * 同时绑定节点级事件（新方案）和组件级事件（旧方案），
     * 将所有需要绑定的事件类型统一委托到根元素。
     *
     * @param instance - 组件实例
     */
    static bindDelegatedEvents(instance: any): void {
        const ctor = instance.constructor;

        const nodeRules: DelegatedEventRule[] = ctor._nodeEventRules || [];
        const tplRules: DelegatedEventRule[] = ctor._delegatedEventRules || [];
        const rules = [...nodeRules, ...tplRules];

        if (!rules || rules.length === 0) return;

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
            const baseDispatch = (domEvt: any, itemInfo?: any) => {
                DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
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

        for (const rule of rules) {
            if (!rule.needsBinding) continue;
            if (rule.nodeName !== '') continue;

            let el: any = instance.el;
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

    private static _ruleKey(rule: DelegatedEventRule): string {
        return `${rule.nodeName}::${rule.event}::${rule.itemType ?? ''}`;
    }

    /**
     * 处理委托事件分发
     *
     * 优先使用节点级匹配（边界限制的祖先遍历），未找到则回退到旧方案。
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

        const dispatchers: Map<string, (...args: any[]) => void> | undefined =
            (instance as any)._delegatedDispatchers;

        const matched = DelegatedEventEngine._matchNodeLevelEvent(
            instance,
            target,
            eventType,
            domEvt,
            rules,
            dispatchers
        );

        if (matched) return;

        DelegatedEventEngine._matchTplLevelEvent(
            instance,
            target,
            eventType,
            domEvt,
            rules,
            dispatchers
        );
    }

    /**
     * 节点级事件匹配 — 从 event.target 向上遍历，查找 NODE_EVENT_META
     *
     * 碰到 COMPONENT_ROOT 即停止，防止跨组件传播。
     *
     * @param instance - 组件实例
     * @param target - 事件目标元素
     * @param eventType - 事件类型
     * @param domEvt - 原生 DOM 事件
     * @param rules - 委托规则数组
     * @param dispatchers - 调度器映射
     * @returns 是否匹配到事件
     */
    private static _matchNodeLevelEvent(
        instance: any,
        target: Element,
        eventType: string,
        domEvt: any,
        rules: DelegatedEventRule[],
        dispatchers?: Map<string, (...args: any[]) => void>
    ): boolean {
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
                    return true;
                }
            }

            if ((current as any)[COMPONENT_ROOT]) break;

            current = current.parentElement;
        }

        return false;
    }

    /**
     * 组件级事件匹配 — 回退到旧方案（containsElement 匹配）
     *
     * @param instance - 组件实例
     * @param target - 事件目标元素
     * @param eventType - 事件类型
     * @param domEvt - 原生 DOM 事件
     * @param rules - 委托规则数组
     * @param dispatchers - 调度器映射
     */
    private static _matchTplLevelEvent(
        instance: any,
        target: Element,
        eventType: string,
        domEvt: any,
        rules: DelegatedEventRule[],
        dispatchers?: Map<string, (...args: any[]) => void>
    ): void {
        let matchedNamedNode = false;

        for (const rule of rules) {
            if (rule.nodeName === '' || rule.event !== eventType) continue;

            const dispatch = dispatchers?.get(DelegatedEventEngine._ruleKey(rule));

            if (rule.itemType) {
                if (!instance.containsElement(rule.nodeName, target)) continue;
                const node = instance.nodeMap?.[rule.nodeName];
                const container = node?.component || instance;
                if (typeof container.getTargetItem !== 'function') continue;
                const itemInfo = container.getTargetItem(target);
                if (!itemInfo || itemInfo.type !== rule.itemType) continue;
                if (dispatch) {
                    dispatch(domEvt, itemInfo);
                } else {
                    DelegatedEventEngine._dispatchRule(instance, rule, domEvt, itemInfo);
                }
                matchedNamedNode = true;
            } else {
                if (instance.containsElement(rule.nodeName, target)) {
                    if (dispatch) {
                        dispatch(domEvt);
                    } else {
                        DelegatedEventEngine._dispatchRule(instance, rule, domEvt);
                    }
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

    /**
     * 分发单个事件规则
     *
     * 构建事件上下文并执行对应的事件动作：handler、emit、bridge、entity、router、system。
     * 事件数据合并：defaultEventData + action + rule.data（额外数据）
     *
     * @param instance - 组件实例
     * @param rule - 委托规则
     * @param domEvt - 原生 DOM 事件对象
     * @param itemInfo - 可选的列表项信息
     */
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

            const actionData = rule.action ? { action: rule.action } : {};

            const eventData = DelegatedEventEngine._collectEventData(
                instance,
                rule.nodeName,
                rule.event,
                eventType
            );

            return mergeEventData(eventData, { ...actionData, ...itemPayload, ...extraData });
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
            if (typeof rule.entities === 'string') {
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
            if (typeof rule.router === 'string') {
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

    /**
     * 解析处理器方法名
     *
     * @param nodeName - 节点名称
     * @param domEvent - DOM 事件名
     * @param handler - 处理器配置
     * @returns 解析后的方法名
     */
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

    /**
     * 解析数据字段声明
     *
     * @param dataDecl - 数据声明
     * @param eventType - 事件类型
     * @returns 该事件类型对应的数据字段数组
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
     * 从组件实例和列表项信息中收集指定字段的值。
     * 支持 getXxx 方法调用和直接属性访问。
     *
     * @param instance - 组件实例
     * @param itemPayload - 列表项信息
     * @param fields - 要收集的字段名数组
     * @returns 收集到的字段值映射对象
     */
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
            } else if (field in instance) {
                result[field] = instance[field];
            }
        }
        return result;
    }

    /**
     * 收集事件数据
     *
     * 调用组件实例的 getEventData 方法获取事件数据。
     * 组件可以覆盖此方法提供额外的事件数据。
     *
     * @param instance - 组件实例
     * @param nodeName - 节点名称
     * @param eventName - 事件名称
     * @param eventType - 事件类型
     * @returns 组件返回的事件数据
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
     *
     * @param instance - 组件实例
     * @param eventName - 事件名称
     * @param data - 事件数据
     * @param source - 事件源标识
     * @param eventType - 事件类型
     * @returns 构建好的 EventContext 对象
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