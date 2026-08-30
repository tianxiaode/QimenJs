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

    get drags(): Record<string, DragOptions> | undefined {
        const cache = this.abilityState(DRAG_CACHE_KEY, () => ({})) ?? {};
        return Object.keys(cache).length > 0 ? cache : undefined;
    },

    set drags(val: Record<string, DragOptions> | undefined) {
        const prev = this.abilityState(DRAG_CACHE_KEY) ?? {};
        if (this._initializing) {
            const merged = val ? { ...prev, ...val } : prev;
            this.setAbilityState(DRAG_CACHE_KEY, merged);
            return;
        }
        this.setAbilityState(DRAG_CACHE_KEY, val ?? {});
        this._syncDrags(prev, val ?? {});
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

        // drag === false: 禁用所有拖拽
        if (dragMode === false) {
            if (Object.keys(cache).length > 0) {
                this.setAbilityState(DRAG_CACHE_KEY, cache);
                this._syncDrags({}, cache);
            }
            return;
        }

        const nodeMap = this.nodeMap ?? {};
        const dragHandle = this.dragHandle;

        // 检查节点级 dragHandle 标记
        let nodeDragHandle: string | undefined;
        for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
            if (nodeName === 'root') continue;
            if ((nodeMeta as any)?.dragHandle === true) {
                nodeDragHandle = nodeName;
                break;
            }
        }

        // drag 有值（true 或 DragOptions）
        if (dragMode !== undefined && dragMode !== null) {
            const handleConfig = typeof dragMode === 'object' ? dragMode : {};

            const effectiveHandle = dragHandle || nodeDragHandle;
            if (effectiveHandle) {
                if (!cache[effectiveHandle]) {
                    cache[effectiveHandle] = handleConfig as DragOptions;
                }
            } else if (nodeMap) {
                for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                    if (nodeName === 'root') continue;
                    const nodeDrag = (nodeMeta as any)?.drag;
                    if (nodeDrag && !cache[nodeName]) {
                        const nodeDragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                        cache[nodeName] = nodeDragConfig as DragOptions;
                    }
                }
            }

            if (!effectiveHandle) {
                const hasTemplateDrag = Object.keys(nodeMap).some(
                    (n: string) => n !== 'root' && (nodeMap as any)[n]?.drag
                );
                if (!hasTemplateDrag) {
                    if (!cache['self']) {
                        cache['self'] = handleConfig as DragOptions;
                    }
                }
            }
        }

        // drag === undefined: 仅使用模板中的 drag 声明 + 节点级 dragHandle
        if (dragMode === undefined && nodeMap) {
            if (nodeDragHandle && !cache[nodeDragHandle]) {
                cache[nodeDragHandle] = {} as DragOptions;
            }
            for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                if (nodeName === 'root') continue;
                const nodeDrag = (nodeMeta as any)?.drag;
                if (nodeDrag && !cache[nodeName]) {
                    const nodeDragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                    cache[nodeName] = nodeDragConfig as DragOptions;
                }
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
            const nodeMap = this.nodeMap ?? {};
            const dragHandle = this.dragHandle;

            if (config) {
                if (dragHandle) {
                    this.attachDrag(dragHandle, config);
                } else {
                    let attached = false;
                    for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                        if (nodeName === 'root') continue;
                        if ((nodeMeta as any)?.drag) {
                            this.attachDrag(nodeName, config);
                            attached = true;
                        }
                    }
                    if (!attached) {
                        this.attachDrag('self', config);
                    }
                }
            } else {
                if (dragHandle) {
                    this.attachDrag(dragHandle, {});
                } else {
                    let attached = false;
                    for (const [nodeName, nodeMeta] of Object.entries(nodeMap)) {
                        if (nodeName === 'root') continue;
                        const nodeDrag = (nodeMeta as any)?.drag;
                        if (nodeDrag) {
                            const dragConfig = typeof nodeDrag === 'object' ? nodeDrag : {};
                            this.attachDrag(nodeName, dragConfig as DragOptions);
                            attached = true;
                        }
                    }
                    if (!attached) {
                        this.attachDrag('self', {});
                    }
                }
            }
        } else {
            const cache = this.abilityState(DRAG_CACHE_KEY) ?? {};
            for (const key of Object.keys(cache)) {
                this.detachDrag(key);
            }
        }
    },
};
