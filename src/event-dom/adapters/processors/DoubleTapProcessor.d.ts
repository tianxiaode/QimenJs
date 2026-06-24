/**
 * @file DoubleTapProcessor.ts
 * @description
 * DoubleTapProcessor 是处理双击手势的处理器类。它继承自GestureProcessor，
 * 通过记录两次点击的时间和位置来判断是否构成双击事件。
 *
 * 该处理器验证两次点击之间的时间间隔和位置距离是否在约束范围内，
 * 以确定是否触发双击语义事件。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * DoubleTapProcessor类
 * 处理双击手势事件，通过时间间隔和位置距离验证判断是否为有效双击
 */
export declare class DoubleTapProcessor extends GestureProcessor<'dblclick'> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'dblclick'>['constraints'];
    private lastTapTime;
    private lastTapX;
    private lastTapY;
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最大时间间隔和最大距离
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'dblclick'>['constraints']);
    /**
     * 重置双击状态
     */
    private resetDoubleTap;
}
//# sourceMappingURL=DoubleTapProcessor.d.ts.map