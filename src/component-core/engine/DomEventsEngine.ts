/**
 * DomEventsEngine — DOM 事件委托引擎
 *
 * 事件体系 ①：DOM 事件委托与转发
 *
 * Pipeline FINALIZE 阶段最后执行（bindDomEvents），
 * 因为需要 el + nodeMap + 子组件全部就绪。
 *
 * 全委托模式：
 *   domEvents 三层嵌套：{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 *   在当前组件 el 上绑定 DOM 事件，事件触发时沿组件路径定位目标，el.contains 匹配。
 *
 * 解绑通过 instance.onCleanup() 自动完成，dispose 时 LIFO 执行。
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 */

import type { DelegatedEventRule } from '../types/tpl-events';
import type { DomEventsMap } from '../types/tpl-events';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import { EventForwarder } from './EventForwarder';
import type { EventDataType } from './EventForwarder';

export class DomEventsEngine {
    /**
     * 编译 domEvents 三层嵌套为 DelegatedEventRule[]
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
     * 每个订阅注册 onCleanup 回调，dispose 时自动解绑。
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
            const handler = (domEvt: any) => {
                DomEventsEngine.handleDelegatedEvent(instance, domEvt, rules);
            };
            instance.on(domEventKey, handler);

            instance.onCleanup(() => {
                instance.off(domEventKey, handler);
            });
        }
    }

    private static _ruleKey(rule: DelegatedEventRule): string {
        return `${rule.componentPath}::${rule.action}::${rule.event}`;
    }

    /**
     * 处理委托事件分发
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
     */
    private static _matchPath(instance: any, componentPath: string, target: Element): any {
        const segments = componentPath.split('.');
        let current: any = instance;

        for (const segment of segments) {
            const nodeMap = current.nodeMap ?? current.nodeMapMgr?.getAll() ?? {};
            const child = nodeMap[segment];
            if (!child) return null;
            current = child.component ?? child;
            if (!current?.el) return null;
        }

        if (!current.el.contains(target)) return null;
        return current;
    }

    private static _matchAction(targetComponent: any, action: string): boolean {
        if (!action) return true;
        return targetComponent.action === action;
    }

    /**
     * 分发单个事件规则
     *
     * handler 本地调用 + EventForwarder 统一转发
     */
    static _dispatchRule(instance: any, rule: DelegatedEventRule, domEvt: any): void {
        if (rule.handler) {
            DomEventsEngine._invokeHandler(instance, rule, domEvt);
        }

        const extraData = DomEventsEngine._buildPayload(instance, rule);
        EventForwarder.forward(instance, rule, extraData, domEvt);
    }

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

    private static _buildPayload(instance: any, rule: DelegatedEventRule): any {
        const actionData = rule.action ? { action: rule.action } : {};

        if (rule.data) {
            const fields = Array.isArray(rule.data) ? rule.data : rule.data;
            if (Array.isArray(fields)) {
                const extraData = DomEventsEngine._collectDataFields(instance, fields);
                return { ...actionData, ...extraData };
            }
        }

        return actionData;
    }

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
}
