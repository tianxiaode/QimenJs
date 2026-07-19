/**
 * EventForwardAbility — 事件统一转发能力
 *
 * 数据驱动 + 统一分发，与 NodePropAbility 同模式：
 *   _handleDomEvent(ctx, nodeName, domEvent, decl)
 *     → 唯一分发点，按类型分发：
 *        handler   → this[handlerName](ctx, el)
 *        emits     → this.emit(emitName, ctx)
 *        bridges   → this.bridgeEmit(eventKey, targetEvent, ctx)
 *        entities  → this.entityEmit(entityKey, action, ctx)
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

    _handleDomEvent(ctx: any, nodeName: string, domEvent: string, decl: DomEventDecl): void {
        const node = this.nodeMap?.[nodeName];
        if (!node) return;

        const el = node.component ? node.component.el : node.el;

        const handler = inferHandlerName(domEvent, nodeName, decl.handler);
        if (handler && typeof (this as any)[handler] === 'function') {
            if (decl.delegate && decl.delegateTarget) {
                const target = (ctx?.target as HTMLElement)?.closest(decl.delegateTarget);
                if (target) (this as any)[handler](ctx, target);
            } else {
                (this as any)[handler](ctx, el);
            }
        }

        if (decl.emits?.length) {
            for (const emitName of decl.emits) {
                this.emit(emitName, ctx);
            }
        }

        if (decl.bridges?.length && this.eventKey) {
            for (const bridge of decl.bridges) {
                this.bridgeEmit(this.eventKey, bridge, ctx);
            }
        }

        if (decl.entities && this.entityKey) {
            this.entityEmit(this.entityKey, decl.entities, ctx);
        }
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

        const callback = (ctx: any) => {
            this._handleDomEvent(this._extractDomEvent(ctx), nodeName, domEvent, decl);
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
