/**
 * DomEventsEngine — DOM 事件委托引擎
 *
 * 事件体系 ①：DOM 事件委托与转发
 *
 * Pipeline FINALIZE 阶段最后执行（bindDomEvents），
 * 因为需要 el + nodeMap + 子组件全部就绪。
 *
 * 新方案（全委托模式）：
 *   domEvents 三层嵌套：{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 *   在当前组件 el 上绑定 DOM 事件，事件触发时沿组件路径定位目标，el.contains 匹配。
 *
 * 旧方案（NODE_EVENT_META 遍历 + COMPONENT_ROOT 边界）已废弃。
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 */

import type { DelegatedEventRule } from '../types/tpl-events';
import type { DomEventsMap } from '../types/tpl-events';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';

type EventDataType = 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

export class DomEventsEngine {
    /**
     * 编译 domEvents 三层嵌套为 DelegatedEventRule[]
     *
     * @param domEvents - 三层嵌套声明
     * @returns 扁平化委托规则数组
     */
    static compileDomEvents(domEvents: DomEventsMap): DelegatedEventRule[] {
        const rules: DelegatedEventRule[] = [];

        for (const [domEvent, pathMap] of Object.entries(domEvents)) {
            for (const [componentPath, actionMap] of Object.entries(pathMap)) {
                for (const [action, config] of Object.entries(actionMap)) {
                    rules.push({
                        event: domEvent,
                        componentPath,
                        action,
                        prefix: config.prefix,
                        data: config.data,
                        emits: config.emits,
                        bridges: config.bridges,
                        entities: config.entities,
                        router: config.router,
                        system: config.system,
                        handler: config.handler,
                        once: config.once,
                        debounce: config.debounce,
                        throttle: config.throttle,
                        needsBinding: true,
                    });
                }
            }
        }

        return rules;
    }

    /**
     * 为组件实例绑定 DOM 委托事件
     *
     * 遍历 domEvents 第一层 key（DOM 事件名），在组件 el 上绑定一次。
     * 事件触发时沿组件路径定位目标组件，el.contains 匹配后执行 eventConfig。
     *
     * @param instance - 组件实例
     */
    static bindDomEvents(instance: any): void {
        const domEvents: DomEventsMap | undefined = instance.domEvents;
        if (!domEvents) return;

        const rules = DomEventsEngine.compileDomEvents(domEvents);
        if (!rules.length) return;

        const ctor = instance.constructor;
        ctor._domEventRules = rules;

        const allEventTypes = new Set<string>();
        for (const rule of rules) {
            if (rule.needsBinding) allEventTypes.add(rule.event);
        }

        const dispatchers = new Map<string, (...args: any[]) => void>();

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            const key = DomEventsEngine._ruleKey(rule);
            let wrapped: (...args: any[]) => void = (domEvt: any) => {
                DomEventsEngine._dispatchRule(instance, rule, domEvt);
            };

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

        instance._domEventDispatchers = dispatchers;

        for (const eventType of allEventTypes) {
            const useCapture = eventType === 'focus' || eventType === 'blur';

            instance.bind(instance.el, eventType as any, {
                capture: useCapture,
                delegated: true,
            });

            const domEventKey = `${DOM_EVENT_PREFIX}${eventType}`;
            instance.on(domEventKey, (domEvt: any) => {
                DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);
            });
        }
    }

    /**
     * 解绑所有 DOM 委托事件（dispose 时调用）
     */
    static unbindDomEvents(instance: any): void {
        const domEvents: DomEventsMap | undefined = instance.domEvents;
        if (!domEvents) return;

        for (const eventType of Object.keys(domEvents)) {
            const domEventKey = `${DOM_EVENT_PREFIX}${eventType}`;
            instance.off(domEventKey);
        }
    }

    private static _ruleKey(rule: DelegatedEventRule): string {
        return `${rule.componentPath}::${rule.action}::${rule.event}`;
    }

    /**
     * 处理委托事件分发
     *
     * 新方案：遍历 rules，对每个 rule 沿 componentPath 定位目标组件，
     * 检查 el.contains(event.target)，匹配则执行。
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
            instance._domEventDispatchers;

        for (const rule of rules) {
            if (rule.event !== eventType) continue;

            const matched = DomEventsEngine._matchPath(instance, rule.componentPath, target);
            if (!matched) continue;

            const actionMatched = DomEventsEngine._matchAction(matched, rule.action);
            if (!actionMatched) continue;

            const dispatch = dispatchers?.get(DomEventsEngine._ruleKey(rule));
            if (dispatch) {
                dispatch(domEvt);
            } else {
                DomEventsEngine._dispatchRule(instance, rule, domEvt);
            }
            return;
        }
    }

    /**
     * 沿组件路径定位目标组件，检查 el.contains(event.target)
     *
     * 'toolbar.Button' → nodeMap.toolbar → 找 Button → Button.el.contains(target)
     *
     * @returns 匹配的目标组件实例，或 null
     */
    private static _matchPath(instance: any, componentPath: string, target: Element): any {
        const segments = componentPath.split('.');
        let current: any = instance;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const nodeMap = current.nodeMap ?? current.nodeMapMgr?.getAll() ?? {};

            if (i === 0) {
                const child = nodeMap[segment];
                if (!child) return null;
                current = child.component ?? child;
            } else {
                const child = nodeMap[segment];
                if (!child) return null;
                current = child.component ?? child;
            }

            if (!current?.el) return null;
        }

        if (!current.el.contains(target)) return null;
        return current;
    }

    /**
     * 检查目标组件的 action 是否匹配
     */
    private static _matchAction(targetComponent: any, action: string): boolean {
        if (!action) return true;
        return targetComponent.action === action;
    }

    /**
     * 分发单个事件规则
     */
    static _dispatchRule(instance: any, rule: DelegatedEventRule, domEvt: any): void {
        if (rule.handler) {
            DomEventsEngine._invokeHandler(instance, rule, domEvt);
        }

        if (rule.emits?.length) {
            const payload = DomEventsEngine._buildPayload(instance, rule, 'emit');
            for (const emitName of rule.emits) {
                const ctx = DomEventsEngine._buildForwardContext(
                    instance, emitName, payload,
                    DomEventsEngine._resolveKey(instance.bridgeKey) ?? '', 'emit'
                );
                if (domEvt) (ctx as any).domEvent = domEvt;
                instance.emit(emitName, ctx);
            }
        }

        if (rule.bridges?.length) {
            const bridgeKey = DomEventsEngine._resolveKey(instance.bridgeKey);
            if (bridgeKey) {
                const payload = DomEventsEngine._buildPayload(instance, rule, 'bridge');
                for (const bridge of rule.bridges) {
                    const ctx = DomEventsEngine._buildForwardContext(
                        instance, bridge, payload, bridgeKey, 'bridge'
                    );
                    instance.bridgeEmit(ctx);
                }
            }
        }

        if (rule.entities && instance.entityKey) {
            const entityName = typeof rule.entities === 'string' ? rule.entities : undefined;
            if (!entityName) return;
            const payload = DomEventsEngine._buildPayload(instance, rule, 'entity');
            const ctx = DomEventsEngine._buildForwardContext(
                instance, entityName, payload, instance.entityKey, 'entity'
            );
            instance.entityEmit(ctx);
        }

        if (rule.router && instance.routeKey) {
            const routeName = typeof rule.router === 'string' ? rule.router : undefined;
            if (!routeName) return;
            const payload = DomEventsEngine._buildPayload(instance, rule, 'router');
            const ctx = DomEventsEngine._buildForwardContext(
                instance, routeName, payload, instance.routeKey, 'router'
            );
            instance.routerEmit?.(ctx);
        }

        if (rule.system?.length) {
            const payload = DomEventsEngine._buildPayload(instance, rule, 'system');
            for (const sysEvent of rule.system) {
                const ctx = DomEventsEngine._buildForwardContext(
                    instance, sysEvent, payload, instance.constructor.name, 'system'
                );
                instance.systemEmit?.(ctx);
            }
        }
    }

    /**
     * 调用组件本地 handler 方法
     *
     * 命名规则：on${PascalCase(componentPathLastPart)}${PascalCase(action)}${PascalCase(domEvent)}
     */
    private static _invokeHandler(instance: any, rule: DelegatedEventRule, domEvt: any): void {
        const pathParts = rule.componentPath.split('.');
        const lastPart = pathParts[pathParts.length - 1];
        const pascalLast = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
        const pascalAction = rule.action.charAt(0).toUpperCase() + rule.action.slice(1);
        const pascalEvent = rule.event.charAt(0).toUpperCase() + rule.event.slice(1);

        const methodName = `on${pascalLast}${pascalAction}${pascalEvent}`;
        const method = instance[methodName];
        if (typeof method === 'function') {
            method.call(instance, domEvt);
        }
    }

    private static _buildPayload(instance: any, rule: DelegatedEventRule, eventType: EventDataType): any {
        const fields = DomEventsEngine._resolveDataFields(rule.data, eventType);
        const extraData = fields ? DomEventsEngine._collectDataFields(instance, fields) : {};
        const actionData = rule.action ? { action: rule.action } : {};

        const eventData = DomEventsEngine._collectEventData(
            instance, rule.componentPath, rule.event, eventType
        );

        return DomEventsEngine._mergeEventData(eventData, { ...actionData, ...extraData });
    }

    private static _resolveDataFields(
        dataDecl: string[] | Record<string, string[]> | undefined,
        eventType: string
    ): string[] | undefined {
        if (!dataDecl) return undefined;
        if (Array.isArray(dataDecl)) return dataDecl;
        return dataDecl[eventType];
    }

    private static _collectDataFields(instance: any, fields: string[]): Record<string, any> {
        const result: Record<string, any> = {};
        for (const field of fields) {
            if (field.startsWith('get') && field.length > 3 && typeof instance[field] === 'function') {
                Object.assign(result, instance[field]());
            } else if (field in instance) {
                result[field] = instance[field];
            }
        }
        return result;
    }

    static _collectEventData(
        instance: any,
        componentPath: string,
        eventName: string,
        eventType: EventDataType
    ): Record<string, any> | undefined {
        if (typeof instance.getEventData === 'function') {
            return instance.getEventData(componentPath, eventName, eventType);
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

    private static _resolveKey(key: any): string | undefined {
        if (!key) return undefined;
        if (typeof key === 'string') return key;
        if (typeof key === 'object' && key.key) return key.key;
        return undefined;
    }

    private static _mergeEventData(eventData: Record<string, any> | undefined, data: any): any {
        if (eventData === undefined) return data;
        if (data === undefined) return eventData;
        if (typeof data === 'object' && typeof eventData === 'object') {
            return { ...eventData, ...data };
        }
        return data;
    }
}