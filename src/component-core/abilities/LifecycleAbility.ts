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
 * 2. 桥接事件：如果有 eventKey，this.bridgeEmit(ctx)
 *
 * bridgeEmit 走 EventBridge，busId 由 EventScope 自动填充，
 * 发送方不需要也不应该直接依赖 globalEventBus。
 */

import type { AbilityDefinition } from '@/composable';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import { EventContextBuilder } from '@/context';

export const LifecycleAbility = {
    _emitMounted(this: any): void {
        if (typeof this.onMounted === 'function') {
            this.onMounted();
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.MOUNTED);
    },

    _emitUpdated(this: any, data?: any): void {
        if (typeof this.onUpdated === 'function') {
            this.onUpdated();
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.UPDATED, data);
    },

    _emitResize(this: any, entry: ResizeObserverEntry): void {
        if (typeof this.onResize === 'function') {
            this.onResize(entry);
        }
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.RESIZE, {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
        });
    },

    _emitLifecycleEvent(this: any, event: string, data?: any): void {
        const eventKey = this.eventKey ?? (this.constructor as any).eventKey;
        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(event)
            .withSource(eventKey ?? this.constructor.name)
            .withSourceType(this.constructor.name)
            .withData(data)
            .build();

        if (typeof this.emit === 'function') {
            this.emit(event, ctx);
        }

        if (eventKey && typeof this.bridgeEmit === 'function') {
            this.bridgeEmit(ctx);
        }
    },
} as AbilityDefinition;
