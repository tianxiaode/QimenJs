/**
 * DragAbility — 拖拽能力
 *
 * 声明式配置，运行时自动初始化：
 * - body.drags 中声明的节点自动绑定 DragProcessor
 * - move 事件本地处理（高频，不走总线）
 * - start/end/enter/leave/drop/cancel 转发到 DragEventBus
 *
 * 拖拽回调通过 body 中定义方法实现：
 *   body: {
 *       drags: { handle: { axis: 'y' } },
 *       onHandleDragStart(ctx) { ... },
 *       onHandleDragMove(ctx) { ... },
 *       onHandleDragEnd(ctx) { ... },
 *   }
 */

import type { AbilityDefinition } from '@/composable';
import { DragEventBus } from '@/events';
import type { DragDecl } from '../types/tpl-body';

export const DragAbility: AbilityDefinition = {
    _dragProcessors: undefined,

    _initDrags(): void {
        const ctor = this.constructor as any;
        const dragsConfig: Record<string, DragDecl> = ctor._drags;
        if (!dragsConfig) return;

        if (!this._dragProcessors) this._dragProcessors = {};

        for (const [nodeName, config] of Object.entries(dragsConfig)) {
            const el = this._resolveNodeEl?.(nodeName);
            if (!el) continue;

            this._setupDragOnNode(nodeName, el, config);
        }
    },

    _setupDragOnNode(nodeName: string, el: HTMLElement, config: DragDecl): void {
        const dragKey = (this.constructor as any).dragKey ?? this.type ?? nodeName;
        const bus = DragEventBus.getInstance();

        let startX = 0;
        let startY = 0;
        let dragging = false;

        const onPointerDown = (e: PointerEvent) => {
            startX = e.clientX;
            startY = e.clientY;
            dragging = false;
            el.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!dragging) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;

                dragging = true;
                bus.dragStart(dragKey, {
                    dragType: nodeName,
                    dragData: config,
                    dragEl: el,
                    dragSource: this,
                });

                if (config.activeClass) el.classList.add(config.activeClass);

                if (typeof this[`on${capitalize(nodeName)}DragStart`] === 'function') {
                    this[`on${capitalize(nodeName)}DragStart`]({ dx, dy, el, originalEvent: e });
                }
            }

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (typeof this[`on${capitalize(nodeName)}DragMove`] === 'function') {
                this[`on${capitalize(nodeName)}DragMove`]({ dx, dy, el, originalEvent: e });
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (dragging) {
                bus.dragEnd(dragKey);

                if (config.activeClass) el.classList.remove(config.activeClass);

                if (typeof this[`on${capitalize(nodeName)}DragEnd`] === 'function') {
                    this[`on${capitalize(nodeName)}DragEnd`]({ el, originalEvent: e });
                }
            }
            dragging = false;
        };

        el.addEventListener('pointerdown', onPointerDown as any);
        el.addEventListener('pointermove', onPointerMove as any);
        el.addEventListener('pointerup', onPointerUp as any);

        this._dragProcessors[nodeName] = {
            off: () => {
                el.removeEventListener('pointerdown', onPointerDown as any);
                el.removeEventListener('pointermove', onPointerMove as any);
                el.removeEventListener('pointerup', onPointerUp as any);
            },
        };

        this.onCleanup(() => {
            this._dragProcessors?.[nodeName]?.off();
        });
    },
};

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
