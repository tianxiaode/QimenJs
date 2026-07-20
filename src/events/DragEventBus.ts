/**
 * DragEventBus 拖拽调度中心
 *
 * 统一管理所有拖拽状态转换事件，使用独立的 eventScope，
 * 与组件事件、桥接事件、浮层事件互不干扰。
 *
 * 核心设计：
 * - 单例模式，全局唯一，拥有独立的 eventScope
 * - 维护全局拖拽状态（当前拖拽源、拖拽数据、拖拽类型）
 * - 只转发低频状态转换事件：start / enter / leave / drop / cancel / end
 * - move 不走总线，由 DragAbility 本地处理
 * - 同一时刻只允许一个活跃拖拽
 *
 * 事件名编码：drag:{dragKey}:{action}
 * 事件数据始终携带 dragKey 和 dragData，确保放置目标能识别拖拽源。
 *
 * @example
 * ```ts
 * const bus = DragEventBus.getInstance();
 *
 * // 拖拽源：开始拖拽
 * bus.dragStart('cardItem', { type: 'task', data: { id: 1, name: 'Task A' } });
 *
 * // 放置目标：监听进入/放下
 * bus.dragOn('cardItem', 'enter', (data) => {
 *     console.log('拖拽进入:', data);
 * });
 * bus.dragOn('cardItem', 'drop', (data) => {
 *     console.log('放下:', data.dragData);
 * });
 *
 * // 拖拽源：结束拖拽
 * bus.dragEnd('cardItem');
 * ```
 */

import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { EventContextBuilder } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';

export interface DragState {
    /** 拖拽源标识 */
    dragKey: string;
    /** 拖拽数据类型 */
    dragType: string | null;
    /** 拖拽携带数据 */
    dragData: any;
    /** 拖拽源元素 */
    dragEl: HTMLElement | null;
    /** 拖拽源组件 */
    dragSource: any;
}

type DragAction = 'start' | 'end' | 'cancel' | 'enter' | 'leave' | 'drop';

function encodeDragEvent(dragKey: string, action: DragAction): string {
    return `drag:${dragKey}:${action}`;
}

export class DragEventBus {
    private static instance: DragEventBus;

    private readonly dragScope: IEventScope;
    private readonly logger: ILogger;

    /** 当前全局拖拽状态，同一时刻只允许一个活跃拖拽 */
    private activeDrag: DragState | null = null;

    private constructor() {
        this.dragScope = globalEventBus.createEventScope();
        this.logger = Logger.for('drag-bus');
        this.logger.debug?.('[DragEventBus] initialized, scopeId =', this.dragScope.getScopeId());
    }

    static getInstance(): DragEventBus {
        if (!DragEventBus.instance) {
            DragEventBus.instance = new DragEventBus();
        }
        return DragEventBus.instance;
    }

    getScopeId(): string {
        return this.dragScope.getScopeId();
    }

    getActiveDrag(): DragState | null {
        return this.activeDrag;
    }

    isDragging(): boolean {
        return this.activeDrag !== null;
    }

    private _emitDrag(event: string, dragKey: string, action: string, data: any): void {
        const ctx = EventContextBuilder.create()
            .withEvent(event)
            .withType(action)
            .withSource(dragKey)
            .withData(data)
            .build();
        this.dragScope.emit(event, ctx);
    }

    dragStart(dragKey: string, state: Omit<DragState, 'dragKey'>): void {
        if (this.activeDrag) {
            this.logger.debug?.('[DragEventBus] dragStart ignored, already dragging');
            return;
        }

        this.activeDrag = { dragKey, ...state };

        const event = encodeDragEvent(dragKey, 'start');
        this.logger.debug?.('[DragEventBus] dragStart, dragKey =', dragKey);
        this._emitDrag(event, dragKey, 'start', this.activeDrag);
    }

    dragEnd(dragKey: string): void {
        if (!this.activeDrag || this.activeDrag.dragKey !== dragKey) return;

        this.logger.debug?.('[DragEventBus] dragEnd, dragKey =', dragKey);

        const event = encodeDragEvent(dragKey, 'end');
        this._emitDrag(event, dragKey, 'end', this.activeDrag);

        this.activeDrag = null;
    }

    dragCancel(dragKey: string): void {
        if (!this.activeDrag || this.activeDrag.dragKey !== dragKey) return;

        this.logger.debug?.('[DragEventBus] dragCancel, dragKey =', dragKey);

        const event = encodeDragEvent(dragKey, 'cancel');
        this._emitDrag(event, dragKey, 'cancel', this.activeDrag);

        this.activeDrag = null;
    }

    dragEnter(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        if (!this.activeDrag || this.activeDrag.dragKey !== dragKey) return;

        this.logger.debug?.('[DragEventBus] dragEnter, dragKey =', dragKey);

        const event = encodeDragEvent(dragKey, 'enter');
        this._emitDrag(event, dragKey, 'enter', {
            ...this.activeDrag,
            dropTarget,
            dropEl,
        });
    }

    dragLeave(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        if (!this.activeDrag || this.activeDrag.dragKey !== dragKey) return;

        this.logger.debug?.('[DragEventBus] dragLeave, dragKey =', dragKey);

        const event = encodeDragEvent(dragKey, 'leave');
        this._emitDrag(event, dragKey, 'leave', {
            ...this.activeDrag,
            dropTarget,
            dropEl,
        });
    }

    dragDrop(dragKey: string, dropTarget: any, dropEl: HTMLElement): void {
        if (!this.activeDrag || this.activeDrag.dragKey !== dragKey) return;

        this.logger.debug?.('[DragEventBus] dragDrop, dragKey =', dragKey);

        const event = encodeDragEvent(dragKey, 'drop');
        this._emitDrag(event, dragKey, 'drop', {
            ...this.activeDrag,
            dropTarget,
            dropEl,
        });

        this.activeDrag = null;
    }

    /**
     * 监听拖拽事件
     */
    dragOn(dragKey: string, action: DragAction, handler: (data: any) => void): () => void {
        const event = encodeDragEvent(dragKey, action);
        this.logger.debug?.('[DragEventBus] dragOn, dragKey =', dragKey, 'action =', action);
        return this.dragScope.on(event, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    /**
     * 一次性监听拖拽事件
     */
    dragOnce(dragKey: string, action: DragAction, handler: (data: any) => void): void {
        const event = encodeDragEvent(dragKey, action);
        this.dragScope.once(event, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.activeDrag = null;
        this.dragScope.dispose();
        this.logger.debug?.('[DragEventBus] disposed');
    }
}

export const dragEventBus = DragEventBus.getInstance();
