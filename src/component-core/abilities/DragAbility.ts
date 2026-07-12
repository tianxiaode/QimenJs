/**
 * DragAbility — 拖拽能力
 *
 * 基于框架 DragProcessor 的 'drag' 手势语义实现，
 * 通过 this.bind(el, 'drag') 绑定拖拽手势，通过 this.on('drag', handler) 监听。
 *
 * 宿主只负责：
 * - 绑定 drag 手势（底层由 DragProcessor 处理 press/move/release/cancel）
 * - 根据 dragAxis 约束位移方向
 * - 根据 dragBounds 约束拖拽范围
 * - 拖拽过程中更新元素位置
 * - 通过 this.emit 发布 dragstart/dragmove/dragend 事件
 *
 * Drag 属性通过 getDrag(key) / setDrag(key, value) 方法访问。
 */

import type { AbilityDefinition } from '@/composable';

/**
 * Drag 配置
 */
export interface DragConfig {
    /** 是否可拖拽，默认 false */
    draggable?: boolean;
    /** 拖拽方向约束，默认 'both' */
    dragAxis?: 'x' | 'y' | 'both';
    /** 拖拽手柄选择器，默认 null（整个元素可拖） */
    dragHandle?: string;
    /** 拖拽范围约束 */
    dragBounds?: HTMLElement | { left?: number; top?: number; right?: number; bottom?: number };
    /** 拖拽时的 CSS class */
    dragActiveClass?: string;
    /** 网格对齐步长 */
    dragGrid?: number;
}

/**
 * 支持的 drag key 类型
 */
export type DragKey = 'draggable' | 'dragAxis' | 'dragHandle' | 'dragBounds' | 'dragActiveClass' | 'dragGrid';

/**
 * drag 默认值
 */
const DRAG_DEFAULTS: Record<string, any> = {
    draggable: false,
    dragAxis: 'both',
};

export const DragAbility: AbilityDefinition = {
    // ─── Drag 属性访问方法 ───

    getDrag(key: DragKey): any {
        if (key in DRAG_DEFAULTS) {
            return this.props[key] ?? DRAG_DEFAULTS[key];
        }
        return this.props[key];
    },

    setDrag(key: DragKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 初始化 Drag — 配置驱动
     *
     * 通过 this.bind(el, 'drag') 绑定框架 DragProcessor，
     * 监听 drag 手势的 start/move/end 阶段，根据 dragAxis/dragBounds 约束位移。
     * 通过 this.emit 发布 dragstart/dragmove/dragend 事件到 EventBus。
     */
    initDrag(config: DragConfig): void {
        const axis = config.dragAxis ?? DRAG_DEFAULTS.dragAxis;
        const handleSelector = config.dragHandle;
        const bounds = config.dragBounds;
        const activeClass = config.dragActiveClass;
        const grid = config.dragGrid;

        // ── 1. 确定拖拽目标 ──

        const target = handleSelector
            ? this.el.querySelector(handleSelector) as HTMLElement
            : this.el;

        if (!target) return;

        // ── 2. 拖拽状态 ──

        let originX = 0;
        let originY = 0;

        // ── 3. 通过框架 bind 绑定 drag 手势 ──

        this.bind(target, 'drag');

        // ── 4. 监听 drag 手势事件 ──

        this.on('drag', (gesture: any) => {
            const domEvent = gesture?.originalEvent ?? gesture?.domEvent ?? gesture;
            const phase = gesture?.phase;

            if (phase === 'start') {
                // 拖拽开始：记录初始位置
                const rect = this.el.getBoundingClientRect();
                originX = rect.left;
                originY = rect.top;

                this.el.style.position = 'absolute';
                if (activeClass) {
                    this.el.classList.add(activeClass);
                }

                this.emit('dragstart', { originX, originY }, { source: this.eventKey, domEvent });
            } else if (phase === 'move') {
                // 拖拽移动：根据约束计算新位置
                let dx = gesture.dx ?? 0;
                let dy = gesture.dy ?? 0;

                // 方向约束
                if (axis === 'x') dy = 0;
                if (axis === 'y') dx = 0;

                let newX = originX + dx;
                let newY = originY + dy;

                // 范围约束
                if (bounds) {
                    const boundRect = bounds instanceof HTMLElement
                        ? bounds.getBoundingClientRect()
                        : bounds;

                    const elWidth = this.el.offsetWidth;
                    const elHeight = this.el.offsetHeight;

                    if (boundRect.left !== undefined) {
                        newX = Math.max(boundRect.left, newX);
                    }
                    if (boundRect.top !== undefined) {
                        newY = Math.max(boundRect.top, newY);
                    }
                    if (boundRect.right !== undefined) {
                        newX = Math.min(boundRect.right - elWidth, newX);
                    }
                    if (boundRect.bottom !== undefined) {
                        newY = Math.min(boundRect.bottom - elHeight, newY);
                    }
                }

                // 网格对齐
                if (grid && grid > 0) {
                    newX = Math.round(newX / grid) * grid;
                    newY = Math.round(newY / grid) * grid;
                }

                this.el.style.left = `${newX}px`;
                this.el.style.top = `${newY}px`;

                this.emit('dragmove', { dx, dy, newX, newY }, { source: this.eventKey, domEvent });
            } else if (phase === 'end') {
                // 拖拽结束
                if (activeClass) {
                    this.el.classList.remove(activeClass);
                }

                this.emit('dragend', undefined, { source: this.eventKey, domEvent });
            } else if (phase === 'cancel') {
                // 拖拽取消
                if (activeClass) {
                    this.el.classList.remove(activeClass);
                }

                this.emit('dragcancel', undefined, { source: this.eventKey, domEvent });
            }
        });

        // ── 5. 在宿主上生成委托方法 ──

        (this as any).setDraggable = (value: boolean) => {
            this.setDrag('draggable', value);
            target.style.touchAction = value ? 'none' : '';
        };

        // ── 6. 初始设置 ──

        target.style.touchAction = 'none';
        target.style.userSelect = 'none';

        // ── 7. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            target.style.touchAction = '';
            target.style.userSelect = '';

            delete (this as any).setDraggable;
        });
    },
};
