/**
 * EventForwardAbility — 事件统一转发能力
 *
 * 数据驱动 + 统一分发，与 NodePropAbility 同模式：
 *   _handleDomEvent(ctx, nodeKey, event, binding)
 *     → 唯一分发点，按类型分发：
 *        handler   → this[handlerName](ctx, el)
 *        emits     → this.emit(emitName, ctx)
 *        bridges   → this.bridgeEmit(eventKey, targetEvent, ctx)
 *        entities  → this.entityEmit(entityKey, action, ctx)
 *
 * 绑定流程：
 *   bindDomEventBindings()
 *     → 遍历 compiled.domEventBindings
 *     → DOM 节点：this.bind(el, event) + this.on('dom:xxx', callback)
 *     → 子组件：childComponent.on(event, callback)
 *     → callback 统一调用 _handleDomEvent
 */

import type { AbilityDefinition } from '@/composable';
import type { DomEventBinding } from '../types/tpl-node-types';
import type { CompiledComponentTemplate } from '../types/template-json';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';

export const EventForwardAbility: AbilityDefinition = {
    bindDomEventBindings(): void {
        const ctor = this.constructor as any;
        const compiled: CompiledComponentTemplate = ctor._compiledTemplate;
        const bindings: DomEventBinding[] = compiled?.domEventBindings;
        if (!bindings || bindings.length === 0) return;

        for (const binding of bindings) {
            const { event, nodeKey } = binding;
            const node = this.nodeMap?.[nodeKey];
            if (!node) continue;

            if (node.component) {
                this._bindComponentEvent(node.component, event, binding);
            } else {
                this._bindDomEvent(node, event, binding);
            }
        }
    },

    _handleDomEvent(ctx: any, nodeKey: string, event: string, binding: DomEventBinding): void {
        const node = this.nodeMap?.[nodeKey];
        if (!node) return;

        const el = node.component ? node.component.el : node.el;
        const { handler, delegate, delegateTarget, emits, bridges, entities } = binding;

        if (handler && typeof (this as any)[handler] === 'function') {
            if (delegate && delegateTarget) {
                const target = (ctx?.target as HTMLElement)?.closest(delegateTarget);
                if (target) (this as any)[handler](ctx, target);
            } else {
                (this as any)[handler](ctx, el);
            }
        }

        if (emits?.length) {
            for (const emitName of emits) {
                this.emit(emitName, ctx);
            }
        }

        if (bridges?.length && this.eventKey) {
            for (const bridge of bridges) {
                this.bridgeEmit(this.eventKey, bridge.targetEvent, ctx);
            }
        }

        if (entities && this.entityKey) {
            this.entityEmit(this.entityKey, entities, ctx);
        }
    },

    _bindDomEvent(node: any, event: string, binding: DomEventBinding): void {
        const el = node.el;
        if (!el) return;

        const { once, delegate, delegateTarget, debounce, throttle, nodeKey } = binding;
        const domEvent = `${DOM_EVENT_PREFIX}${event}`;

        const bindOptions: any = {};
        if (debounce && debounce > 0) bindOptions.debounce = debounce;
        if (throttle && throttle > 0) bindOptions.throttle = throttle;

        if (delegate) {
            this.bind(el, event as any, { ...bindOptions, selector: delegateTarget });
        } else {
            this.bind(el, event as any, bindOptions);
        }

        const callback = (ctx: any) => {
            this._handleDomEvent(this._extractDomEvent(ctx), nodeKey, event, binding);
        };

        if (once) {
            this.once(domEvent, callback);
        } else {
            this.on(domEvent, callback);
        }
    },

    _bindComponentEvent(component: any, event: string, binding: DomEventBinding): void {
        const { once, nodeKey } = binding;

        const callback = (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            this._handleDomEvent(data, nodeKey, event, binding);
        };

        if (once) {
            component.once?.(event, callback);
        } else {
            const off = component.on?.(event, callback);
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },
};
