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

import type { DelegatedEventRule } from '../types/events';
import type { DomEventsMap } from '../types/events';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { debounce, throttle } from '@qimenjs/async';
import { EventForwarder } from './EventForwarder';
import type { EventDataType } from './EventForwarder';

/**
 * DomEventConfig 合法的属性键集合
 *
 * 用于区分 DomEventConfig（两层模式）和 action→config 映射（三层模式），
 * 以及检测隐式 root 简写：{ handler: '_onInput' } → root 委托。
 */
const CONFIG_KEYS = [
    'handler',
    'emits',
    'bridges',
    'entities',
    'router',
    'system',
    'data',
    'once',
    'debounce',
    'throttle',
];

// Note: 'bridges' is kept as the config key name for forwarding to ComponentEventBus
// for backward compatibility. The runtime method is now componentEmit.

/** DOM 事件委托引擎，在组件 el 上绑定 DOM 事件并沿组件路径分发 */
export class DomEventsEngine {
    /**
     * 编译 domEvents 为 DelegatedEventRule[]
     *
     * 支持三种语法：
     * 1. 三层模式（显式 action）：path → { action: config }
     * 2. 两层模式（[action] 占位符）：path → config（自动设 action='' 和 wildcardAction=true）
     * 3. 隐式 root 简写：{ handler: '_onInput' } → root 委托，无需显式写 'root' 路径
     *
     * 通用特性：
     * - 逗号分隔多路径：'path1,path2,path3' → 生成多条规则
     *
     * @example
     * ```ts
     * // 隐式 root 简写 — 自动推断为 root 委托
     * domEvents = {
     *   input: { handler: '_onInput' },      // → root: { handler: '_onInput' }
     *   click: { emits: ['close'] },          // → root: { emits: ['close'] }
     * };
     *
     * // 显式路径 — 仍然支持
     * domEvents = {
     *   click: { closeBtn: { handler: true } },
     * };
     * ```
     */
    static compileDomEvents(domEvents: DomEventsMap): DelegatedEventRule[] {
        const rules: DelegatedEventRule[] = [];

        for (const [domEvent, pathMap] of Object.entries(domEvents)) {
            for (const [componentPath, value] of Object.entries(pathMap)) {
                // 检测隐式 root 简写：componentPath 是已知配置键 + value 是基本类型
                const isImplicitRoot = DomEventsEngine._isImplicitRoot(componentPath, value);
                const isTwoLayer = !isImplicitRoot && DomEventsEngine._isDomEventConfig(value);

                if (isImplicitRoot) {
                    // 隐式 root 简写：{ handler: '_onInput' } → root 委托
                    // value 是基本类型，componentPath 是配置键，直接构造 DomEventConfig
                    const config: Record<string, any> = { [componentPath]: value };
                    rules.push(DomEventsEngine._buildRule(domEvent, 'root', '', config));
                    continue;
                }

                // 解析逗号分隔的多路径
                const paths = componentPath.split(',').map(p => p.trim());

                for (const path of paths) {
                    if (isTwoLayer) {
                        // 两层模式：value 直接是 DomEventConfig
                        const config = value as any;
                        rules.push(DomEventsEngine._buildRule(domEvent, path, '', config));
                    } else {
                        // 三层模式：value 是 { [action]: DomEventConfig }
                        const actionMap = value as Record<string, any>;
                        for (const [action, config] of Object.entries(actionMap)) {
                            rules.push(DomEventsEngine._buildRule(domEvent, path, action, config));
                        }
                    }
                }
            }
        }

        return rules;
    }

    /**
     * 构建单条 DelegatedEventRule（统一提取，消除重复代码）
     */
    private static _buildRule(
        domEvent: string,
        componentPath: string,
        action: string,
        config: any
    ): DelegatedEventRule {
        const wildcardAction = config.emits?.includes('[action]') ?? false;
        return {
            event: domEvent,
            componentPath,
            action,
            wildcardAction,
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
        };
    }

    /**
     * 检测隐式 root 简写
     *
     * 当 componentPath 是已知 DomEventConfig 属性键（如 handler、emits），
     * 且 value 为基本类型（string/boolean/number/array，非 plain object）时，视为 root 委托简写。
     *
     * @example
     * ```ts
     * _isImplicitRoot('handler', '_onInput')  // true
     * _isImplicitRoot('emits', ['close'])     // true（数组也是隐式 root）
     * _isImplicitRoot('closeBtn', true)       // false（'closeBtn' 不是配置键）
     * _isImplicitRoot('handler', { handler: true })  // false（value 是 plain object，进入两层模式）
     * ```
     */
    private static _isImplicitRoot(componentPath: string, value: any): boolean {
        if (value === null) return false;
        // Arrays and other non-plain-object primitives qualify as implicit root
        // Only plain objects (DomEventConfig and action maps) should NOT qualify
        if (typeof value === 'object' && !Array.isArray(value)) return false;
        return CONFIG_KEYS.includes(componentPath);
    }

    /**
     * 判断 value 是否为 DomEventConfig（两层模式）
     *
     * DomEventConfig 包含 handler/emits/bridges/entities/router/system 等字段，
     * 而三层模式的 value 是 { [action]: DomEventConfig }，keys 为 action 名。
     */
    private static _isDomEventConfig(value: any): boolean {
        if (!value || typeof value !== 'object') return false;
        return CONFIG_KEYS.some(key => key in value);
    }

    /**
     * 深度合并两个 DomEventsMap
     *
     * 支持两层、三层模式和隐式 root 简写混合：
     *   - 两层模式：path → DomEventConfig
     *   - 三层模式：path → { action: DomEventConfig }
     *   - 隐式 root 简写：{ handler: 'method' } → root 委托
     *
     * 隐式 root 简写在合并时会被归一化为显式 root 条目，
     * 多个简写条目（如 handler + emits）会合并到同一个 root 配置中。
     *
     * dynamic 配置优先级高于 static。
     */
    private static _mergeDomEvents(
        staticMap: DomEventsMap,
        dynamicMap: DomEventsMap
    ): DomEventsMap {
        const result: DomEventsMap = {};

        // 加载静态映射，同时归一化隐式 root 条目到 'root' key 下
        for (const [domEvent, pathMap] of Object.entries(staticMap)) {
            result[domEvent] = {};
            for (const [componentPath, value] of Object.entries(pathMap)) {
                if (DomEventsEngine._isImplicitRoot(componentPath, value)) {
                    const rootConfig: Record<string, any> = { [componentPath]: value };
                    const existingRoot = result[domEvent]['root'];
                    if (existingRoot && DomEventsEngine._isDomEventConfig(existingRoot)) {
                        result[domEvent]['root'] = {
                            ...(existingRoot as Record<string, any>),
                            ...rootConfig,
                        };
                    } else {
                        result[domEvent]['root'] = rootConfig;
                    }
                } else {
                    result[domEvent][componentPath] = value;
                }
            }
        }

        for (const [domEvent, pathMap] of Object.entries(dynamicMap)) {
            if (!result[domEvent]) {
                result[domEvent] = {};
                for (const [componentPath, value] of Object.entries(pathMap)) {
                    if (DomEventsEngine._isImplicitRoot(componentPath, value)) {
                        result[domEvent]['root'] = { [componentPath]: value };
                    } else {
                        result[domEvent][componentPath] = value;
                    }
                }
                continue;
            }

            const targetPathMap = result[domEvent];
            for (const [componentPath, newValue] of Object.entries(pathMap)) {
                const existingValue = targetPathMap[componentPath];

                // 检测隐式 root 简写：configKey + 基本类型值
                const newIsImplicit = DomEventsEngine._isImplicitRoot(componentPath, newValue);

                if (newIsImplicit) {
                    // 归一化隐式 root：存储到 'root' key 下，与现有 root 配置合并
                    const rootConfig: Record<string, any> = { [componentPath]: newValue };
                    const existingRoot = targetPathMap['root'];

                    if (existingRoot && DomEventsEngine._isDomEventConfig(existingRoot)) {
                        targetPathMap['root'] = {
                            ...(existingRoot as Record<string, any>),
                            ...rootConfig,
                        };
                    } else {
                        targetPathMap['root'] = rootConfig;
                    }

                    // 清理原隐式 root 条目（如果与 root 不同）
                    if (componentPath !== 'root') {
                        delete targetPathMap[componentPath];
                    }
                    continue;
                }

                // 新值是两层模式（DomEventConfig）
                if (DomEventsEngine._isDomEventConfig(newValue)) {
                    // 若路径为 'root' 且已有 root 配置，则合并而非覆盖
                    if (
                        componentPath === 'root' &&
                        existingValue &&
                        DomEventsEngine._isDomEventConfig(existingValue)
                    ) {
                        targetPathMap['root'] = {
                            ...(existingValue as Record<string, any>),
                            ...(newValue as Record<string, any>),
                        };
                    } else {
                        targetPathMap[componentPath] = { ...(newValue as Record<string, any>) };
                    }
                    continue;
                }

                // 现有值不存在，直接赋值
                if (!existingValue) {
                    targetPathMap[componentPath] = { ...(newValue as Record<string, any>) };
                    continue;
                }

                // 现有值是两层模式，新值是三层模式 → 转换现有值为三层模式
                if (DomEventsEngine._isDomEventConfig(existingValue)) {
                    const converted: Record<string, any> = {
                        '': { ...(existingValue as Record<string, any>) },
                    };
                    for (const [action, config] of Object.entries(
                        newValue as Record<string, any>
                    )) {
                        converted[action] = { ...config };
                    }
                    targetPathMap[componentPath] = converted;
                    continue;
                }

                // 都是三层模式，合并 action
                const targetActionMap = existingValue as Record<string, any>;
                for (const [action, config] of Object.entries(newValue as Record<string, any>)) {
                    targetActionMap[action] = { ...config };
                }
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

        const dispatchers = new Map<string, (domEvt: any, actualAction?: string) => void>();

        for (const rule of rules) {
            if (!rule.needsBinding) continue;

            const key = DomEventsEngine._ruleKey(rule);
            let wrapped = (domEvt: any, actualAction?: string) => {
                DomEventsEngine._dispatchRule(instance, rule, domEvt, actualAction);
            };

            if (rule.debounce && rule.debounce > 0) {
                wrapped = debounce(wrapped, rule.debounce);
            } else if (rule.throttle && rule.throttle > 0) {
                wrapped = throttle(wrapped, rule.throttle);
            }

            if (rule.once) {
                let called = false;
                const original = wrapped;
                wrapped = (domEvt: any, actualAction?: string) => {
                    if (called) return;
                    called = true;
                    return original(domEvt, actualAction);
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
     *
     * 支持 [action] 占位符：
     *   当 rule.action 为空字符串 '' 时，使用 matched 组件的 action 属性作为实际 action
     *   用于替换 emits 中的 '[action]' 和生成方法名
     */
    static handleDelegatedEvent(instance: any, domEvt: any, rules: DelegatedEventRule[]): void {
        const originalEvent = domEvt?.data?.originalEvent;
        const target = originalEvent?.target ?? domEvt?.target as Element;
        if (!target) return;

        const eventType = domEvt?.data?.semantic ?? domEvt?.data?.signal as string;
        if (!eventType) return;

        const dispatchers: Map<string, (...args: any[]) => void> | undefined =
            instance._domEventDispatchers;

        for (const rule of rules) {
            if (rule.event !== eventType) continue;

            const matched = DomEventsEngine._matchPath(instance, rule.componentPath, target);
            if (!matched) continue;

            const actionMatched = DomEventsEngine._matchAction(
                matched,
                rule.action,
                rule.wildcardAction
            );
            if (!actionMatched) continue;

            // 动态 action：当 wildcardAction 或 rule.action 为空时，使用 matched 组件的实际 action
            const actualAction =
                rule.wildcardAction || !rule.action ? matched.action || '' : rule.action;

            const dispatch = dispatchers?.get(DomEventsEngine._ruleKey(rule));
            if (dispatch) {
                dispatch(domEvt, actualAction);
            } else {
                DomEventsEngine._dispatchRule(instance, rule, domEvt, actualAction);
            }
            return;
        }
    }

    /**
     * 通过 nodeMap 定位目标组件
     *
     * 路径每段语义互斥：
     *   - 若在当前组件 nodeMap 中能找到 → 用 nodeMap 定位
     *   - 若在 nodeMap 中找不到 → 按组件类型名查找（在子组件中找类型匹配的）
     *
     * 第一段也支持类型查找（在 isItemContainer 的 _items 中按类型定位）。
     *
     * 示例：
     *   'header.action'         → header 在 nodeMap；action 在 header.nodeMap
     *   'toolsLeft.Button'      → toolsLeft 在 nodeMap；Button 按类型查找
     *   'Panel.header.action'   → Panel 按类型在 _items 中查找；header 在 Panel.nodeMap
     *
     * 定位完成后，仍会尝试深度查找最深层子组件
     * （ItemGroup 等容器场景，使 _matchAction 能检查到具体子项的 action）
     */
    private static _matchPath(instance: any, componentPath: string, target: Element): any {
        const segments = componentPath.split('.');
        const nodeMap = instance.nodeMap ?? instance.nodeMapMgr?.getAll() ?? {};
        const firstNode = nodeMap[segments[0]];

        let currentComponent: any;
        if (firstNode) {
            currentComponent = firstNode.component ?? firstNode;
        } else {
            const el = instance.nodeElements?.[segments[0]];
            if (el) {
                currentComponent = { el };
            } else {
                currentComponent = instance.nodeInstances?.[segments[0]]
                    ?? DomEventsEngine._findByType(instance, segments[0], target);
            }
        }
        if (!currentComponent?.el) return null;
        if (!currentComponent.el.contains(target)) return null;

        for (let i = 1; i < segments.length; i++) {
            const seg = segments[i];
            const nestedNodeMap =
                currentComponent.nodeMap ?? currentComponent.nodeMapMgr?.getAll?.() ?? {};

            const nestedNode = nestedNodeMap[seg];
            if (nestedNode) {
                const next = nestedNode.component ?? nestedNode;
                if (!next?.el || !next.el.contains(target)) return null;
                currentComponent = next;
                continue;
            }

            const el = currentComponent.nodeElements?.[seg];
            if (el) {
                currentComponent = { el };
                continue;
            }

            const byType = DomEventsEngine._findByType(currentComponent, seg, target);
            if (!byType) return null;
            currentComponent = byType;
        }

        const deeperMatch = DomEventsEngine._findDeepestChild(currentComponent, target);
        return deeperMatch ?? currentComponent;
    }

    /**
     * 在子组件中按类型名查找
     * - isItemContainer 组件：在 _items 数组中查找
     * - 普通组件：在 nodeMap 中查找
     * 匹配规则：component.constructor._type === type 或 类名去掉 Component 后缀
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
     * 递归查找容器组件内最深层匹配的子组件
     * - isItemContainer 组件：通过 getTargetItem 在 _items 中查找
     * - 普通组件：在 nodeMap 中查找
     */
    private static _findDeepestChild(component: any, target: Element): any {
        if (component.isItemContainer && typeof component.getTargetItem === 'function') {
            const item = component.getTargetItem(target);
            if (item?.component) {
                const nested = DomEventsEngine._findDeepestChild(item.component, target);
                return nested ?? item.component;
            }
            return null;
        }

        const nodeMap = component.nodeMap ?? component.nodeMapMgr?.getAll?.() ?? {};
        if (!nodeMap) return null;

        for (const node of Object.values(nodeMap)) {
            const childComponent = (node as any).component ?? node;
            if (!childComponent?.el) continue;
            if (childComponent === component) continue;
            if (childComponent.el.contains(target)) {
                const nested = DomEventsEngine._findDeepestChild(childComponent, target);
                return nested ?? childComponent;
            }
        }
        return null;
    }

    /**
     * 获取组件的所有子组件
     * - isItemContainer 组件：返回 _items 中的 component
     * - 普通组件：返回 nodeMap 中的 component
     */
    private static _getChildren(component: any): any[] {
        if (component.isItemContainer && Array.isArray(component._items)) {
            return component._items.map((item: any) => item.component);
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

    private static _matchAction(
        targetComponent: any,
        action: string,
        wildcardAction?: boolean
    ): boolean {
        // 通配符模式：匹配任何 action
        if (wildcardAction) return true;
        // 空 action：匹配无 action 的组件
        if (!action) return true;
        return targetComponent.action === action;
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
        actualAction?: string
    ): void {
        if (rule.handler) {
            DomEventsEngine._invokeHandler(instance, rule, domEvt, actualAction);
        }

        const extraData = DomEventsEngine._buildPayload(instance, rule, actualAction);
        EventForwarder.forward(instance, rule, extraData, domEvt, actualAction);
    }

    private static _invokeHandler(
        instance: any,
        rule: DelegatedEventRule,
        domEvt: any,
        actualAction?: string
    ): void {
        let methodName: string;

        if (typeof rule.handler === 'string') {
            // 自定义方法名
            methodName = rule.handler;
        } else {
            // 自动推导方法名
            const pathParts = rule.componentPath.split('.');
            const pascalPath = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

            const resolvedAction = actualAction ?? rule.action;
            const pascalAction = resolvedAction
                ? resolvedAction.charAt(0).toUpperCase() + resolvedAction.slice(1)
                : '';
            const pascalEvent = rule.event.charAt(0).toUpperCase() + rule.event.slice(1);

            methodName = `on${pascalPath}${pascalAction}${pascalEvent}`;
        }

        const method = instance[methodName];
        if (typeof method === 'function') {
            method.call(instance, domEvt);
        }
    }

    private static _buildPayload(
        instance: any,
        rule: DelegatedEventRule,
        actualAction?: string
    ): any {
        const resolvedAction = actualAction ?? rule.action;
        const actionData = resolvedAction ? { action: resolvedAction } : {};

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
