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
 * 2. 桥接事件：如果有 eventKey，this.bridgeEmit(eventKey, event, data)
 *
 * 调用方式：
 * - mounted：DOM 挂载后调用 this._emitMounted()
 * - updated：属性/内容更新后调用 this._emitUpdated(data)
 * - resize：ResizeObserver 回调中调用 this._emitResize(entry)
 */

import type { AbilityDefinition } from '@/composable';
import { COMPONENT_LIFECYCLE_EVENTS, globalEventBus } from '@/events';
import { EventContextBuilder } from '@/context';

export const LifecycleAbility: AbilityDefinition = {
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
        if (typeof this.emit === 'function') {
            this.emit(event, data);
        }

        const eventKey = this.eventKey ?? (this.constructor as any).eventKey;
        if (eventKey && typeof this.bridgeEmit === 'function') {
            const ctx = EventContextBuilder.create()
                .withEvent(event)
                .withType(event)
                .withSource(eventKey)
                .withSourceType(this.constructor.name)
                .withData(data)
                .withBusId(globalEventBus.getBusId())
                .build();
            this.bridgeEmit(ctx);
        }
    },
};
