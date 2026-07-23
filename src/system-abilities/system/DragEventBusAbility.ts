/**
 * DragEventBusAbility 拖拽事件总线系统能力
 *
 * 将 DragEventBus 单例的方法暴露为组件实例方法，
 * 组件可直接通过 this.dragOn() / this.dragStart() / this.dragEnd() 调用。
 *
 * 与 OverlayEventBusAbility 对称：
 * - OverlayEventBusAbility → 浮层事件总线
 * - DragEventBusAbility → 拖拽事件总线
 */

import type { AbilityDefinition } from '@/composable';
import { DragEventBus } from '@/events';
import type { DragState, DragAction } from '@/events';

export const DragEventBusAbility= {
    dragStart(dragKey: string, state: Omit<DragState, 'dragKey'>): void {
        DragEventBus.getInstance().dragStart(dragKey, state);
    },

    dragEnd(dragKey: string): void {
        DragEventBus.getInstance().dragEnd(dragKey);
    },

    dragCancel(dragKey: string): void {
        DragEventBus.getInstance().dragCancel(dragKey);
    },

    dragEnter(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragEnter(dragKey, dropTarget, dropEl);
    },

    dragLeave(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragLeave(dragKey, dropTarget, dropEl);
    },

    dragDrop(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        DragEventBus.getInstance().dragDrop(dragKey, dropTarget, dropEl);
    },

    dragOn(dragKey: string, action: DragAction, handler: (data: any) => void): () => void {
        const off = DragEventBus.getInstance().dragOn(dragKey, action, handler);
        this.onCleanup(off);
        return off;
    },

    dragOnce(dragKey: string, action: DragAction, handler: (data: any) => void): void {
        DragEventBus.getInstance().dragOnce(dragKey, action, handler);
    },

    getActiveDrag(): DragState | null {
        return DragEventBus.getInstance().getActiveDrag();
    },

    isDragging(): boolean {
        return DragEventBus.getInstance().isDragging();
    },
} satisfies AbilityDefinition;
