/**
 * DragAbility — 拖拽能力
 *
 * 提供拖拽的完整生命周期管理，包括缓存管理、事件发射、diff/sync，
 * 以及 attach/detach/start/stop API。
 * 通过 `dragEmit` 向 DragDispatchCenter 发送事件。
 *
 * 通信链路：
 *   能力 → dragEmit → DragDispatchCenter → 管理拖拽实例
 *
 * @example
 * // 组件 options 中声明
 * drag: true
 * drag: { axis: 'x', grid: 10 }
 * drag: { type: 'item', axis: 'both' }
 */

import type { AbilityDefinition } from '@/composable';
import { DRAG_ACTIONS } from '@/events';
import { DRAG_CACHE_KEY } from '../../constants';
import type { DragOptions } from '../../types';

/** 拖拽能力，提供 attach/detach/start/stop 等 API */
export const DragAbility: AbilityDefinition = {
    // ── 缓存管理 ──

    drags: {
        get(): Record<string, DragOptions> | undefined {
            const cache = this.abilityState(DRAG_CACHE_KEY, () => ({})) ?? {};
            return Object.keys(cache).length > 0 ? cache : undefined;
        },

        set(val: Record<string, DragOptions> | undefined) {
            const prev = this.abilityState(DRAG_CACHE_KEY) ?? {};
            if (this._initializing) {
                const merged = val ? { ...prev, ...val } : prev;
                this.setAbilityState(DRAG_CACHE_KEY, merged);
                return;
            }
            this.setAbilityState(DRAG_CACHE_KEY, val ?? {});
            this._syncDrags(prev, val ?? {});
        },
    },

    _emitDragInit(key: string, options: DragOptions): void {
        const componentId = this.id;
        this.dragEmit(
            `drag:${componentId}:${DRAG_ACTIONS.INIT}`,
            { component: this, drags: { [key]: options } },
            { type: DRAG_ACTIONS.INIT, source: componentId }
        );
    },

    _emitDragAction(key: string, action: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            `drag:${dragKey}:${action}`,
            { component: this },
            { type: action, source: dragKey }
        );
    },

    // ── Diff & Sync ──

    _syncDrags(prev: Record<string, DragOptions>, next: Record<string, DragOptions>): void {
        this._ensureDragComponentId();

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        const removed = prevKeys.filter(k => !nextKeys.includes(k));
        const added = nextKeys.filter(k => !prevKeys.includes(k));
        const changed = nextKeys.filter(
            k => prevKeys.includes(k) && JSON.stringify(prev[k]) !== JSON.stringify(next[k])
        );

        for (const key of removed) {
            this._emitDragAction(key, DRAG_ACTIONS.DISPOSE);
        }
        for (const key of added) {
            this._emitDragInit(key, next[key]);
        }
        for (const key of changed) {
            this._emitDragAction(key, DRAG_ACTIONS.DISPOSE);
            this._emitDragInit(key, next[key]);
        }
    },

    // ── 提交 ──

    _commitDrags(): void {
        const dragMode = this.drag;
        const cache = this.abilityState(DRAG_CACHE_KEY) ?? {};

        // drag === false 或 undefined: 禁用所有拖拽
        if (dragMode === false || dragMode === undefined) {
            if (Object.keys(cache).length > 0) {
                this.setAbilityState(DRAG_CACHE_KEY, cache);
                this._syncDrags({}, cache);
            }
            return;
        }

        const dragHandle = this.dragHandle;
        const handleConfig = typeof dragMode === 'object' ? dragMode : {};

        // drag 有值（true 或 DragOptions）：使用 dragHandle 或默认为 'self'
        if (dragHandle) {
            const effectiveHandle = dragHandle;
            if (!cache[effectiveHandle]) {
                cache[effectiveHandle] = handleConfig as DragOptions;
            }
        } else {
            if (!cache['self']) {
                cache['self'] = handleConfig as DragOptions;
            }
        }

        if (Object.keys(cache).length === 0) return;

        this.setAbilityState(DRAG_CACHE_KEY, cache);
        this._syncDrags({}, cache);
    },

    // ── 结构变更方法 ──

    attachDrag(key: string, options: DragOptions): void {
        const current = this.abilityState(DRAG_CACHE_KEY) ?? {};
        this.drags = { ...current, [key]: options };
    },

    detachDrag(key: string): void {
        const current = this.abilityState(DRAG_CACHE_KEY) ?? {};
        if (!current[key]) return;
        const next = { ...current };
        delete next[key];
        this.drags = Object.keys(next).length > 0 ? next : undefined;
    },

    // ── 拖拽会话控制 ──

    startDrag(key: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            `drag:${dragKey}:${DRAG_ACTIONS.START}`,
            { component: this, key },
            { type: DRAG_ACTIONS.START, source: dragKey }
        );
    },

    stopDrag(key: string): void {
        const dragKey = `${this.id}:${key}`;
        this.dragEmit(
            `drag:${dragKey}:${DRAG_ACTIONS.STOP}`,
            { component: this, key },
            { type: DRAG_ACTIONS.STOP, source: dragKey }
        );
    },

    // ── 便捷开关 ──

    setDraggable(enabled: boolean, config?: DragOptions): void {
        if (enabled) {
            const dragHandle = this.dragHandle;
            const handleConfig = config || {};

            if (dragHandle) {
                this.attachDrag(dragHandle, handleConfig);
            } else {
                this.attachDrag('self', handleConfig);
            }
        } else {
            const cache = this.abilityState(DRAG_CACHE_KEY) ?? {};
            for (const key of Object.keys(cache)) {
                this.detachDrag(key);
            }
        }
    },
} satisfies AbilityDefinition;
