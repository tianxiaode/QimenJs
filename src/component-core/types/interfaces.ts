import { IComponentCore } from './core';

/**
 * 指示器接口（从 IComponentCore 派生）
 */
export interface IIndicator extends IComponentCore {
    indicatorType: string;
    activeIndex: number;
    setActive(index: number): void;
    next(): void;
    prev(): void;
}

/**
 * 拖拽影子接口（从 IComponentCore 派生）
 */
export interface IDragGhost extends IComponentCore {
    update(x: number, y: number): void;
    onDragStart?(e: DragEvent): void;
    onDragEnd?(e: DragEvent): void;
}

/**
 * 对话框接口（从 IComponentCore 派生）
 */
export interface IDialog extends IComponentCore {
    open(): void;
    close(): void;
    onConfirm?(): void;
    onCancel?(): void;
}

/**
 * 弹出层接口（从 IComponentCore 派生）
 */
export interface IPopover extends IComponentCore {
    open(): void;
    close(): void;
}
