/**
 * @file DragProcessor.ts
 * @description
 * DragProcessor 是处理拖拽手势的处理器类。它继承自GestureProcessor，
 * 用于处理拖拽开始、移动、结束和取消等阶段事件。
 *
 * 该处理器跟踪鼠标/触摸的按下、移动和释放事件，当移动距离超过最小阈值时，
 * 触发拖拽开始事件，并在移动过程中持续发送拖拽移动事件。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * DragProcessor类
 * 处理拖拽手势事件，包含开始、移动、结束和取消阶段
 */
export declare class DragProcessor extends GestureProcessor {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'drag'>['constraints'];
    private dragging;
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小拖拽距离
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'drag'>['constraints']);
    /**
     * 按下事件处理
     * @param input - 手势输入信息
     */
    private onPress;
    /**
     * 移动事件处理
     * @param input - 手势输入信息
     */
    private onMove;
    /**
     * 释放事件处理
     * @param input - 手势输入信息
     */
    private onRelease;
    /**
     * 取消事件处理
     */
    private onCancel;
}
//# sourceMappingURL=DragProcessor.d.ts.map