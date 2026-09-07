/**
 * DomEventsEngine — DOM 事件委托引擎
 *
 * 事件体系 ①：DOM 事件委托与转发
 *
 * Pipeline FINALIZE 阶段最后执行（bindDomEvents），
 * 因为需要 el + nodeMap + 子组件全部就绪。
 *
 * 两层扁平模式：
 *   domEvents: { [domEvent]: DomEventRule | DomEventRule[] }
 *   在当前组件 el 上绑定 DOM 事件，事件触发时沿 path 定位目标，el.contains 匹配。
 *
 * path 段语法：
 *   裸字符串  = name 查找（nodeMap 中按 name 定位）
 *   [xxx]     = option 查找（component[xxx] getter）
 *   {Type}    = type 查找（子组件中按类型匹配）
 *
 * 解绑通过 instance.onCleanup() 自动完成，dispose 时 LIFO 执行。
 */

import type { DelegatedEventRule, DomEventRule } from '../types/events';
import type { DomEventsMap } from '../types/events';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import { EventForwarder } from './EventForwarder';

/** DOM 事件委托引擎，在组件 el.上绑定 DOM 事件并沿 path 分发 */
export class DomEventsEngine {
    /**
     * 编译 domEvents 为 DelegatedEventRule[]
     *
     * 从两层扁平结构编译：{ [domEvent]: DomEventRule | DomEventRule[] }
     */
    static compileDomEvents(domEvents: DomEventsMap): DelegatedEventRule[] {
        const rules: DelegatedEventRule[] = [];

        for (const [domEvent, value] of Object.entries(domEvents)) {
            const ruleList = Array.isArray(value) ? value : [value];
            for (const rule of ruleList) {
                rules.push(...DomEventsEngine._buildRule(domEvent, rule));
            }
        }

        return rules;
    }

    private static _buildRule(domEvent: string, rule: DomEventRule): DelegatedEventRule[] {
        const paths = rule.path.split(',');
        return paths.map(p => ({
            event: domEvent,
            path: p,
            data: rule.data,
            emits: rule.emits,
            bridges: rule.bridges,
            entities: rule.entities,
            router: rule.router,
            system: rule.system,
            handler: rule.handler,
            once: rule.once,
            debounce: rule.debounce,
            throttle: rule.throttle,
            needsBinding: true,
        }));
    }

    /**
     * 深度合并两个 DomEventsMap
     *
     * dynamic 配置优先级高于 static。
     * 同一 domEvent 下的规则数组直接拼接。
     */
    private static _mergeDomEvents(
        staticMap: DomEventsMap,
        dynamicMap: DomEventsMap
    ): DomEventsMap {
        const result: DomEventsMap = { ...staticMap };

        for (const [domEvent, value] of Object.entries(dynamicMap)) {
            const dynamicRules = Array.isArray(value) ? value : [value];
            const existing = result[domEvent];
            if (existing) {
                const existingRules = Array.isArray(existing) ? existing : [existing];
                result[domEvent] = [...existingRules, ...dynamicRules];
            } else {
                result[domEvent] = value;
            }
        }

        return result;
    }

    /**
     * 为组件实例绑定 DOM 委托事件
     *
     * 遍历 domEvents 第一层 key（DOM 事件名），在组件 el 上绑定一次。
     * 每个订阅注册 onCleanup 回调，dispose 时自动解绑。
     *
     * 支持动态构建：若实例有 buildDomEvents(props) 方法，
     * 则将其返回的 DomEventsMap 与静态 domEvents 深度合并后再编译。
     */
    static bindDomEvents(instance: any): void {
        const staticDomEvents: DomEventsMap | undefined = instance.domEvents;

        let merged: DomEventsMap = staticDomEvents ? { ...staticDomEvents } : {};

        if (typeof instance.buildDomEvents === 'function') {
            const dynamic = instance.buildDomEvents(instance.props);
            if (dynamic && typeof dynamic === 'object') {
                merged = DomEventsEngine._mergeDomEvents(merged, dynamic);
            }
        }

        if (!merged || Object.keys(merged).length === 0) return;

        const rules = DomEventsEngine.compileDomEvents(merged);
        if (!rules.length) return;

        const ctor = instance.constructor;
        ctor._domEventRules = rules;

        const allEventTypes = new Set<string>();
        for (const rule of rules) {
            if (rule.needsBinding) allEventTypes.add(rule.event);
        }

        const dispatchers = new Map<
            string,
            (domEvt: any, targetComponent?: any) => void
        >();

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            const key = DomEventsEngine._ruleKey(rule);
            let wrapped = (domEvt: any, targetComponent?: any) => {
                DomEventsEngine._dispatchRule(
                    instance,
                    rule,
                    domEvt,
                    targetComponent
                );
            };

            if (rule.debounce && rule.debounce > 0) {
                wrapped = debounce(wrapped, rule.debounce);
            } else if (rule.throttle && rule.throttle > 0) {
                wrapped = throttle(wrapped, rule.throttle);
            }

            if (rule.once) {
                let called = false;
                const original = wrapped;
                wrapped = (domEvt: any, _targetComponent?: any) => {
                    if (called) return;
                    called = true;
                    return original(domEvt);
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
            const off = instance.on(domEventKey, handler);

            instance.onCleanup(() => {
                off();
            });
        }
    }

    private static _ruleKey(rule: DelegatedEventRule): string {
        return `${rule.path}::${rule.event}`;
    }

    /**
     * 处理委托事件分发
     *
     * path 逐段定位目标组件，el.contains 验证，disable 检查
     */
    static handleDelegatedEvent(instance: any, domEvt: any, rules: DelegatedEventRule[]): void {
        const originalEvent = domEvt?.data?.originalEvent;
        const target = originalEvent?.target ?? (domEvt?.target as Element);
        if (!target) return;

        const eventType = domEvt?.data?.semantic ?? (domEvt?.data?.signal as string);
        if (!eventType) return;

        // 容器自身 disable 时拦截所有委托事件
        if (instance.disable) return;

        const dispatchers: Map<string, (...args: any[]) => void> | undefined =
            instance._domEventDispatchers;

        for (const rule of rules) {
            if (rule.event !== eventType) continue;

            const1            const matched = DomEventsEngine._matchPath(instance, rule.path, target);
            if (!matched) continue;

3            if (matched.disable) continue;

            const dispatch = dispatchers?.get(DomEventsEngine._ruleKey(rule));
            if (dispatch) {
&                dispatch(domEvt, matched);
            } else {
                DomEventsEngine._dispatchRule(instance, rule, domEvt, matched);
            }
            return;
        }
    }

        const eventType = domEvt?.data?.semantic ?? (domEvt?.data?.signal as string);
        if (!eventType) {
            console.info('[DomEvents] handleDelegatedEvent: no eventType, domEvt.data:', domEvt?.data);
            return;
        }

        console.info('[DomEvents] handleDelegatedEvent:', instance.constructor?.name ?? instance.type, 'eventType:', eventType, 'target:', target);

        // 容器自身 disable 时拦截所有委托事件
        if (instance.disable) {
            console.info('[DomEvents] instance disabled, abort');
            return;
        }

        const dispatchers: Map<string, (...args: any[]) => void> | undefined =
            instance._domEventDispatchers;

        for (const rule of rules) {
            if (rule.event !== eventType) continue;

            const matched = DomEventsEngine._matchPath(instance, rule.path, target);
            if (!matched) continue;

            if (matched.disable) continue;

            const dispatch = dispatchers?.get(DomEventsEngine._ruleKey(rule));
            if (dispatch) {
                dispatch(domEvt, matched);
            } else {
                DomEventsEngine._dispatchRule(instance, rule, domEvt, matched);
            }
            return;
        }
    }

    /**
     * 通过 path 逐段定位目标组件
     *
     * path 段语法：
     *   裸字符串  = name 查找（nodeMap 中按 name 定位）
     *   [xxx]     = option 查找（component[xxx] getter，返回组件或数组）
     *   {Type}    = type 查找（子组件中按类型匹配）
     *
     * [xxx] 返回数组时（如 [items]），在数组中找 el.contains(target) 的那个组件
     */
    private static _matchPath(instance: any, path: string, target: Element): any {
        if (path === '') {
            if (!instance?.el) return null;
            if (!instance.el.contains(target)) return null;
            return instance;
        }

        const segments = path.split('.');
        let currentComponent: any = instance;

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!currentComponent) return null;
            if (currentComponent.disable) return null;

            // [xxx] = option 查找
            if (seg.startsWith('[') && seg.endsWith(']')) {
                const optionName = seg.slice(1, -1);
                const value = currentComponent[optionName];
                if (!value) return null;

                // 数组（如 items）：在数组中找 el.contains(target) 的组件
                if (Array.isArray(value)) {
                    let found: any = null;
                    for (const item of value) {
                        if (item?.el && item.el.contains(target)) {
                            found = item;
                            break;
                        }
                    }
                    if (!found) return null;
                    currentComponent = found;
                } else {
                    // 非数组：必须是组件实例（有 el）才能继续穿透
                    if (!value?.el) return null;
                    currentComponent = value;
                }
                continue;
            }

            // {Type} = type 查找
            if (seg.startsWith('{') && seg.endsWith('}')) {
                const typeName = seg.slice(1, -1);
                const byType = DomEventsEngine._findByType(currentComponent, typeName, target);
                if (!byType) return null;
                currentComponent = byType;
                continue;
            }

            // 裸字符串 = name 查找（nodeMap）
            const nodeMap = currentComponent.nodeMap ?? currentComponent.nodeMapMgr?.getAll?.() ?? {};
            const node = nodeMap[seg];
            if (node) {
                currentComponent = node.component ?? node;
                continue;
            }

            // nodeElements（DOM 节点 name）
            const el = currentComponent.nodeElements?.[seg];
            if (el) {
                currentComponent = { el };
                continue;
            }

            // nodeInstances
            const inst = currentComponent.nodeInstances?.[seg];
            if (inst) {
                currentComponent = inst;
                continue;
            }

            return null;
        }

        // 验证最终组件的 el 包含 target
        if (!currentComponent?.el) return null;
        if (!currentComponent.el.contains(target)) return null;

        return currentComponent;
    }

    /**
     * 在子组件中按类型名查找
     * - isItemContainer 组件：在 _items 数组中查找
     * - 普通组件：在 childComponentList / nodeMap 中查找
     * 匹配规则：component.constructor._type === type 或类名去掉 Component 后缀
     */
    private static _findByType(component: any, type: string, target: Element): any {
        const children = DomEventsEngine._getChildren(component);
        for (const childComp of children) {
            if (!childComp?.el) continue;
            if (!childComp.el.contains(target)) continue;
            const ctor = childComp.constructor;
            const childType =
                ctor?._type || ctor?.name?.replace(/Component$/, '') || childComp.type;
            if (childType === type) return childComp;
        }
        return null;
    }

    /**
     * 获取组件的所有子组件
     * - isItemContainer 组件：返回 _items 中的 component
     * - 普通组件：优先返回 childComponentList，回退到 nodeMap/nodeInstances
     */
    private static _getChildren(component: any): any[] {
        if (component.isItemContainer && Array.isArray(component._items)) {
            return component._items.map((item: any) => item.component);
        }
        if (
            Array.isArray(component.childComponentList) &&
            component.childComponentList.length > 0
        ) {
            return component.childComponentList;
        }
        const nodeMap = component.nodeMap ?? component.nodeMapMgr?.getAll?.() ?? {};
        if (Object.keys(nodeMap).length > 0) {
            return Object.values(nodeMap).map((node: any) => node?.component ?? node);
        }
        const children: any[] = [];
        if (component.nodeInstances) {
            children.push(...Object.values(component.nodeInstances));
        }
        return children;
    }

    /**
     * 分发单个事件规则
     *
     * handler 本地调用 + EventForwarder 统一转发
     */
    static _dispatchRule(
        instance: any,
        rule: DelegatedEventRule,
        domEvt: any,
        targetComponent?: any
    ): void {
        if (rule.handler) {
            DomEventsEngine._invokeHandler(instance, rule, domEvt, targetComponent);
        }

        const extraData = DomEventsEngine._buildPayload(instance, rule);
        EventForwarder.forward(instance, rule, extraData, domEvt);
    }

    private static _invokeHandler(
        instance: any,
        rule: DelegatedEventRule,
        domEvt: any,
        targetComponent?: any
    ): void {
        let methodName: string;

        if (typeof rule.handler === 'string') {
            methodName = rule.handler;
        } else {
            // 自动推导方法名：on{LastSegment}{Event}
            const segments = rule.path.split('.');
            const lastSeg = segments[segments.length - 1];
            // 去掉括号符号，取实际名称
            const cleanName = lastSeg.replace(/[\[\]{}]/g, '');
            const pascalName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            const pascalEvent = rule.event.charAt(0).toUpperCase() + rule.event.slice(1);
            methodName = `on${pascalName}${pascalEvent}`;
        }

        const method = instance[methodName];
        if (typeof method === 'function') {
            method.call(instance, domEvt, targetComponent);
        }
    }

    private static _buildPayload(
        instance: any,
        rule: DelegatedEventRule
    ): any {
        if (rule.data) {
            const fields = Array.isArray(rule.data) ? rule.data : rule.data;
            if (Array.isArray(fields)) {
                return DomEventsEngine._collectDataFields(instance, fields);
            }
        }

        return {};
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
