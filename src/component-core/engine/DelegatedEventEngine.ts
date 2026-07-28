/**
 * DelegatedEventEngine — 委托事件引擎
 *
 * 纯函数引擎：编译 tplEvents 为运行时元数据 + 运行时委托绑定/分发
 *
 * 编译时：compileTplEvents(tplEvents) → DelegatedEventRule[]
 * 运行时：bindDelegatedEvents(instance) → 根 el 委托 + 少量内部绑定
 *         handleDelegatedEvent(instance, event, rules) → 分发
 *
 * @module DelegatedEventEngine
 *
 * @remarks
 * ## 核心职责
 * 1. **编译时**：将模板事件声明（TplEvents）编译为可执行的委托规则（DelegatedEventRule[]）
 * 2. **运行时**：为组件实例绑定委托事件监听器，并在事件触发时分发到正确的处理函数
 *
 * ## 事件类型支持
 * - **handler**：调用组件方法处理事件
 * - **emit**：向上冒泡事件，通知父组件
 * - **bridge**：通过 bridgeEmit 跨层级传递事件
 * - **entity**：触发实体相关事件
 * - **router**：触发路由事件
 * - **system**：触发系统级事件
 *
 * @example
 * ```ts
 * // 编译时：将模板事件声明编译为规则
 * const rules = DelegatedEventEngine.compileTplEvents({
 *   button: { click: { handler: true } },
 *   list: { $items: { Item: { click: { emits: ['itemClick'] } } } }
 * });
 *
 * // 运行时：为组件实例绑定事件
 * DelegatedEventEngine.bindDelegatedEvents(componentInstance);
 * ```
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
import { ComponentRegistrar } from '../ComponentRegistrar';

type EventDataType = 'handler' | 'emit' | 'bridge' | 'entity' | 'float' | 'router' | 'system';

export class DelegatedEventEngine {
    /**
     * 编译模板事件声明为委托规则
     *
     * 将模板中定义的事件声明编译为运行时可执行的委托规则数组。
     * 支持普通节点事件、列表项事件（$items）等多种事件类型。
     *
     * @param tplEvents - 模板事件声明对象，key 为节点名称，value 为事件配置
     * @returns 委托规则数组，包含所有编译后的事件处理规则
     *
     * @example
     * ```ts
     * const rules = DelegatedEventEngine.compileTplEvents({
     *   // 普通节点事件
     *   button: {
     *     click: { handler: true },           // 调用 onButtonClick 方法
     *     dblclick: { emits: ['doubleClick'] } // 触发 doubleClick 事件
     *   },
     *   // 列表项事件
     *   list: {
     *     $items: {
     *       Item: {
     *         click: { emits: ['itemClick'], keyProp: 'name' }
     *       }
     *     }
     *   }
     * });
     * ```
     *
     * @remarks
     * - 支持数组形式的多事件声明
     * - 自动合并组件默认事件数据（defaultEventData）
     * - 编译结果会缓存到组件构造函数的 `_delegatedEventRules` 属性
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
     * @param nodeName - 节点名称，用于生成处理器方法名
     * @param event - DOM 事件名（如 click、change）
     * @param action - 事件动作配置
     * @returns 编译后的委托规则，如果无有效动作则返回 null
     *
     * @example
     * ```ts
     * const rule = _compileEventAction('button', 'click', {
     *   handler: true,
     *   emits: ['buttonClick'],
     *   debounce: 300
     * });
     * // 返回包含 handler='onButtonClick'、emits=['buttonClick']、debounce=300 的规则
     * ```
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
     * @param rules - 规则数组，新规则将被添加到此数组
     * @param nodeName - 列表容器节点名称
     * @param itemTypeEvents - item 类型到事件声明的映射
     *
     * @example
     * ```ts
     * // 模板声明
     * // list: { $items: { UserItem: { click: { emits: ['userClick'] } } } }
     * _compileItemEvents(rules, 'list', { UserItem: { click: { emits: ['userClick'] } } });
     * // 会为 UserItem 生成带有 itemType='UserItem'、keyProp='name' 的规则
     * ```
     *
     * @remarks
     * - 自动设置 itemType 标识
     * - 默认 keyProp 为 'name'，可在声明中覆盖
     * - 会从 ComponentRegistrar 获取组件的 defaultEventData 并合并
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
     * 将基础数据字段与额外数据字段合并，支持数组和对象两种格式。
     *
     * @param base - 基础数据字段数组
     * @param extra - 额外数据字段，可以是数组或按事件类型分组的对象
     * @returns 合并后的数据字段，数组或对象格式与 extra 一致
     *
     * @example
     * ```ts
     * // 数组合并
     * _mergeData(['id', 'name'], ['value']);
     * // 返回: ['id', 'name', 'value']
     *
     * // 对象合并
     * _mergeData(['id'], { click: ['value'], change: ['text'] });
     * // 返回: { click: ['id', 'value'], change: ['id', 'text'] }
     * ```
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
     * 根据编译后的委托规则，为组件实例绑定事件监听器。
     * 支持 focus/blur 的捕获阶段、debounce/throttle 调节、once 单次触发等特性。
     *
     * @param instance - 组件实例，需要有 el、bind、on 等方法
     *
     * @example
     * ```ts
     * // 在组件初始化时调用
     * class MyComponent extends Component {
     *   created() {
     *     DelegatedEventEngine.bindDelegatedEvents(this);
     *   }
     * }
     * ```
     *
     * @remarks
     * - focus/blur 事件使用捕获阶段（capture: true）
     * - 支持 debounce 和 throttle 选项
     * - 支持 once 单次触发
     * - 空节点名（''）表示绑定到根元素
     */
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

    /**
     * 处理委托事件分发
     *
     * 当委托事件触发时，根据事件目标匹配对应的规则并分发执行。
     * 支持普通节点事件和列表项事件的匹配分发。
     *
     * @param instance - 组件实例
     * @param domEvt - 原生 DOM 事件对象
     * @param rules - 委托规则数组
     *
     * @example
     * ```ts
     * // 在事件监听器中调用
     * instance.on('dom:click', (domEvt) => {
     *   DelegatedEventEngine.handleDelegatedEvent(instance, domEvt, rules);
     * });
     * ```
     *
     * @remarks
     * - 首先尝试匹配命名节点事件
     * - 如果未匹配，则尝试匹配根元素事件（nodeName === ''）
     * - 列表项事件需要额外匹配 itemType
     */
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

    /**
     * 分发单个事件规则
     *
     * 根据规则配置执行对应的事件动作：handler、emit、bridge、entity、router、system。
     * 构建事件上下文并传递给各动作处理器。
     *
     * @param instance - 组件实例
     * @param rule - 委托规则
     * @param domEvt - 原生 DOM 事件对象
     * @param itemInfo - 可选的列表项信息，包含 component、type 等
     *
     * @example
     * ```ts
     * // 执行 handler 动作
     * _dispatchRule(instance, { handler: 'onClick', nodeName: 'button' }, domEvt);
     * // 调用: instance.onClick(domEvt, el, payload);
     *
     * // 执行 emit 动作
     * _dispatchRule(instance, { emits: ['click'], nodeName: 'button' }, domEvt);
     * // 调用: instance.emit('click', eventContext);
     * ```
     *
     * @remarks
     * - handler 支持动态方法名（根据 keyProp 解析）
     * - emit 会同时触发通用事件和 keyProp 特定事件
     * - 各动作类型会构建独立的 payload
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

    /**
     * 解析处理器方法名
     *
     * 根据节点名、事件名和处理器配置，推导出实际要调用的方法名。
     *
     * @param nodeName - 节点名称
     * @param domEvent - DOM 事件名
     * @param handler - 处理器配置：true 表示自动生成，string 表示指定方法名
     * @returns 解析后的方法名，如果无处理器则返回 undefined
     *
     * @example
     * ```ts
     * _resolveHandlerName('button', 'click', true);
     * // 返回: 'onButtonClick'
     *
     * _resolveHandlerName('', 'click', true);
     * // 返回: 'onClick'
     *
     * _resolveHandlerName('button', 'click', 'handleClick');
     * // 返回: 'handleClick'
     * ```
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
     * 根据事件类型从数据声明中提取对应的字段列表。
     *
     * @param dataDecl - 数据声明，可以是数组或按事件类型分组的对象
     * @param eventType - 事件类型（handler/emit/bridge等）
     * @returns 该事件类型对应的数据字段数组
     *
     * @example
     * ```ts
     * _resolveDataFields(['id', 'name'], 'handler');
     * // 返回: ['id', 'name']
     *
     * _resolveDataFields({ handler: ['id'], emit: ['name'] }, 'emit');
     * // 返回: ['name']
     * ```
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
     * @param itemPayload - 列表项信息，包含 component 等
     * @param fields - 要收集的字段名数组
     * @returns 收集到的字段值映射对象
     *
     * @example
     * ```ts
     * // 组件有 getName() 方法
     * _collectDataFields(instance, null, ['getName']);
     * // 返回: { ...instance.getName() }
     *
     * // 列表项有 name 属性
     * _collectDataFields(instance, { component: { name: 'item1' } }, ['name']);
     * // 返回: { name: 'item1' }
     * ```
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
     * @returns 组件返回的事件数据，如果组件没有实现则返回 undefined
     *
     * @example
     * ```ts
     * // 组件实现
     * class MyComponent extends Component {
     *   getEventData(nodeName, eventName, eventType) {
     *     return { userId: this.userId, timestamp: Date.now() };
     *   }
     * }
     * ```
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
     * 创建用于事件转发（emit/bridge/entity等）的 EventContext 对象。
     * 自动维护事件调用链，支持事件溯源。
     *
     * @param instance - 组件实例
     * @param eventName - 事件名称
     * @param data - 事件数据
     * @param source - 事件源标识（如 eventKey、entityKey 等）
     * @param eventType - 事件类型
     * @returns 构建好的 EventContext 对象
     *
     * @example
     * ```ts
     * const ctx = _buildForwardContext(instance, 'click', { id: 1 }, 'myEventKey', 'emit');
     * // ctx 包含: event, type, source, sourceType, data, busId, chain
     * ```
     *
     * @remarks
     * - 会深拷贝数据对象，避免引用污染
     * - 自动维护事件调用链（chain）
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
