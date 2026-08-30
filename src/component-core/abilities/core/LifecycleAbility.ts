/**
 * LifecycleAbility — 组件生命周期事件能力
 *
 * 统一管理生命周期钩子的调用和事件发送：
 * - onMounted → mounted 事件
 * - onUpdated → updated 事件
 * - onResize → resize 事件
 *
 * 事件发送规则：
 * 1. 本地事件：this.emit(event, data)
 * 2. 组件事件：如果有 eventKey，this.componentEmit(ctx)
 *
 * componentEmit 走 ComponentEventBus，busId 由 EventScope 自动填充，
 * 发送方不需要也不应该直接依赖 globalEventBus。
 */

import type { AbilityDefinition } from '@/composable';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

/** 组件生命周期事件能力，统一管理 mounted/updated/resize 钩子调用与事件发送 */
export const LifecycleAbility = {
    _emitMounted(): void {
        if (typeof this.onMounted === 'function') {
            this.onMounted();
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.MOUNTED);
    },

    _emitUpdated(data?: any): void {
        if (typeof this.onUpdated === 'function') {
            this.onUpdated();
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.UPDATED, data);
    },

    _emitResize(entry: ResizeObserverEntry): void {
        if (typeof this.onResize === 'function') {
            this.onResize(entry);
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.RESIZE, {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
        });
    },

    _emitLifecycleEvent(event: string, data?: any): void {
        const eventKey = this.eventKey ?? (this.constructor as any).eventKey;
        const ctx = this.eventCtx(event, data);

        if (typeof this.emit === 'function') {
            this.emit(event, ctx);
        }

        if (eventKey && typeof this.componentEmit === 'function') {
            this.componentEmit(event, ctx);
        }
    },
} as AbilityDefinition;
