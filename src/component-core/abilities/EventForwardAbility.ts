/**
 * EventForwardAbility — 事件统一转发能力
 *
 * 数据驱动 + 统一分发，与 NodePropAbility 同模式：
 *   _handleDomEvent(data, nodeName, domEvent, decl, originalDomEvent?)
 *     → 唯一分发点，按类型分发：
 *        handler   → this[handlerName](originalDomEvent ?? data, el)
 *        emits     → this.emit(emitName, payload, { domEvent })
 *        bridges   → this.bridgeEmit(ctx)
 *        entities  → this.entityEmit(ctx)
 *
 * 数据收集约定（组件在 body 中定义）：
 *   getEventData(nodeName, eventName, eventType) → 统一数据钩子
 *     - eventType: 'emit' | 'bridge' | 'entity'
 *     - 组件根据参数返回不同数据，相同数据直接返回一个对象即可
 *
 * 示例：
 *   body: {
 *       getEventData(nodeName, eventName, eventType) {
 *           if (eventType === 'bridge') return { value: this.text, source: this.id };
 *           return { value: this.text };
 *       },
 *   }
 *
 * 事件总线统一约定：
 *   - 所有事件总线只接收 EventContext
 *   - EventForwardAbility 负责构建 EventContext
 *   - EventScope.emit 自动补回 scopeId
 *
 * 绑定流程：
 *   bindDomEventBindings()
 *     → 遍历 nodeMap，取每个节点的 events（原始 DomEventDecl）
 *     → DOM 节点：this.bind(el, event) + this.on('dom:xxx', callback)
 *     → 子组件：childComponent.on(event, callback)
 *     → callback 统一调用 _handleDomEvent
 */

import type { AbilityDefinition } from '@/composable';
import type { DomEventDecl } from '../types/tpl-node-types';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import type { EventContext, EventChainLink } from '@/context';
import { EventContextBuilder } from '@/context';
import { globalEventBus } from '@/events';
import { object } from '@/utils';
import { getId } from '@/utils/string/id';

type EventDataType = 'emit' | 'bridge' | 'entity' | 'float';

export const EventForwardAbility: AbilityDefinition = {
    bindDomEventBindings(): void {
        if (!this.nodeMap) return;

        for (const [nodeName, node] of Object.entries(this.nodeMap as Record<string, any>)) {
            if (!node.events) continue;

            for (const [domEvent, decl] of Object.entries(
                node.events as Record<string, DomEventDecl>
            )) {
                if (node.component) {
                    this._bindComponentEvent(node.component, nodeName, domEvent, decl);
                } else {
                    this._bindDomEvent(node, nodeName, domEvent, decl);
                }
            }
        }
    },

    _handleDomEvent(
        data: any,
        nodeName: string,
        domEvent: string,
        decl: DomEventDecl,
        originalDomEvent?: any
    ): void {
        const node = this.nodeMap?.[nodeName];
        if (!node) return;

        const el = node.component ? node.component.el : node.el;

        const handler = inferHandlerName(domEvent, nodeName, decl.handler);
        if (handler && typeof (this as any)[handler] === 'function') {
            const handlerCtx = originalDomEvent ?? data;
            if (decl.delegate && decl.delegateTarget) {
                const target = (handlerCtx?.target as HTMLElement)?.closest(decl.delegateTarget);
                if (target) (this as any)[handler](handlerCtx, target);
            } else {
                (this as any)[handler](handlerCtx, el);
            }
        }

        if (decl.emits?.length) {
            for (const emitName of decl.emits) {
                const eventData = this._collectEventData(nodeName, emitName, 'emit');
                const payload = mergeEventData(eventData, data);
                const ctx = this._buildForwardContext(
                    emitName,
                    payload,
                    this.eventKey ?? '',
                    'emit'
                );
                if (originalDomEvent) {
                    ctx.domEvent = originalDomEvent;
                }
                this.emit(emitName, ctx);
            }
        }

        if (decl.bridges?.length && this.eventKey) {
            for (const bridge of decl.bridges) {
                const bridgeData = this._collectEventData(nodeName, bridge, 'bridge');
                const payload = mergeEventData(bridgeData, data);
                const ctx = this._buildForwardContext(bridge, payload, this.eventKey, 'bridge');
                this.bridgeEmit(ctx);
            }
        }

        if (decl.entities && this.entityKey) {
            const entityData = this._collectEventData(nodeName, domEvent, 'entity');
            const payload = mergeEventData(entityData, data);
            const ctx = this._buildForwardContext(decl.entities, payload, this.entityKey, 'entity');
            this.entityEmit(ctx);
        }
    },

    _collectEventData(
        nodeName: string,
        eventName: string,
        eventType: EventDataType
    ): Record<string, any> | undefined {
        if (typeof (this as any).getEventData === 'function') {
            return (this as any).getEventData(nodeName, eventName, eventType);
        }
        return undefined;
    },

    _buildForwardContext(
        eventName: string,
        data: any,
        source: string,
        eventType: EventDataType
    ): EventContext {
        const currentCtx = this._currentEventContext as EventContext | undefined;
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
            .withSourceType(this.constructor.name)
            .withData(clonedData)
            .withBusId(globalEventBus.getBusId())
            .withChain(chain)
            .build();
    },

    _bindDomEvent(node: any, nodeName: string, domEvent: string, decl: DomEventDecl): void {
        const el = node.el;
        if (!el) return;

        const { once, delegate, delegateTarget, debounce, throttle } = decl;
        const domEventKey = `${DOM_EVENT_PREFIX}${domEvent}`;

        const bindOptions: any = {};
        if (debounce && debounce > 0) bindOptions.debounce = debounce;
        if (throttle && throttle > 0) bindOptions.throttle = throttle;

        if (delegate) {
            this.bind(el, domEvent as any, { ...bindOptions, selector: delegateTarget });
        } else {
            this.bind(el, domEvent as any, bindOptions);
        }

        const callback = (domEvt: any) => {
            this._handleDomEvent(undefined, nodeName, domEvent, decl, domEvt);
        };

        if (once) {
            this.once(domEventKey, callback);
        } else {
            this.on(domEventKey, callback);
        }
    },

    _bindComponentEvent(
        component: any,
        nodeName: string,
        domEvent: string,
        decl: DomEventDecl
    ): void {
        const { once } = decl;

        const callback = (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            this._handleDomEvent(data, nodeName, domEvent, decl);
        };

        if (once) {
            component.once?.(domEvent, callback);
        } else {
            const off = component.on?.(domEvent, callback);
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },
};

function inferHandlerName(
    domEvent: string,
    nodeName: string,
    handler: boolean | string | undefined
): string | undefined {
    if (handler === true) {
        const capitalEvent = domEvent.charAt(0).toUpperCase() + domEvent.slice(1);
        const capitalKey = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
        return nodeName ? `on${capitalKey}${capitalEvent}` : `on${capitalEvent}`;
    }
    if (typeof handler === 'string') return handler;
    return undefined;
}

function mergeEventData(eventData: Record<string, any> | undefined, data: any): any {
    if (eventData === undefined) return data;
    if (data === undefined) return eventData;
    if (typeof data === 'object' && typeof eventData === 'object') {
        return { ...eventData, ...data };
    }
    return data;
}
