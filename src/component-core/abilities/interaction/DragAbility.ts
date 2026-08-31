/**
 * DragAbility — 拖拽能力
 *
 * 单源模型：一个组件就是一个拖动源，`drag` option 即唯一状态。
 * 通过 DragEventBus 的 init/dispose 通道通知 DragDispatchCenter，
 * 组件不感知调度中心。
 *
 * 通信链路：
 *   能力 → dragInit/dragDispose → DragEventBus → DragDispatchCenter
 *
 * 拖拽回调约定（由调度中心在组件上查找）：
 *   onDragStart / onDragMove / onDragEnd / onDragCancel
 *
 * @example
 * // 组件 options 中声明
 * drag: true
 * drag: { axis: 'x', grid: 10 }
 */

import type { AbilityDefinition } from '@/composable';
import { DRAG_ACTIONS } from '@/events';
import type { DragOptions } from '../../types';

/** 拖拽能力，提供 startDrag/stopDrag/setDraggable 等 API */
export const DragAbility: AbilityDefinition = {
    // ── 提交 ──

    /**
     * 提交拖拽状态：drag 有值（true 或 DragOptions）→ 注册，
     * drag 为 false/null/undefined → 注销
     */
    _commitDrags(): void {
        const componentId = this.id;
        if (!componentId) return;

        const dragMode = this.drag;

        if (dragMode === false || dragMode === null || dragMode === undefined) {
            this.dragDispose(componentId);
            return;
        }

        const config = typeof dragMode === 'object' ? dragMode : {};
        const handleEl = config.handle ? this.getNodeEl(config.handle) : undefined;
        this.dragInit(this, config, handleEl);
    },

    // ── 拖拽会话控制 ──

    /** 程序化开始拖拽会话（由调度中心消费） */
    startDrag(): void {
        const componentId = this.id;
        if (!componentId) return;
        this.dragEmit(
            `drag:${componentId}:${DRAG_ACTIONS.START}`,
            { component: this },
            {
                type: DRAG_ACTIONS.START,
                source: componentId,
            }
        );
    },

    /** 程序化停止拖拽会话（由调度中心消费） */
    stopDrag(): void {
        const componentId = this.id;
        if (!componentId) return;
        this.dragEmit(
            `drag:${componentId}:${DRAG_ACTIONS.STOP}`,
            { component: this },
            {
                type: DRAG_ACTIONS.STOP,
                source: componentId,
            }
        );
    },

    // ── 便捷开关 ──

    /**
     * 设置拖拽启用状态
     *
     * @param enabled - 是否启用
     * @param config - 拖拽配置（可选）
     *
     * @example
     * this.setDraggable(true);
     * this.setDraggable(true, { axis: 'x' });
     * this.setDraggable(false);
     */
    setDraggable(enabled: boolean, config?: DragOptions): void {
        this.drag = enabled ? (config ?? true) : false;
        this._commitDrags();
    },
} satisfies AbilityDefinition;
