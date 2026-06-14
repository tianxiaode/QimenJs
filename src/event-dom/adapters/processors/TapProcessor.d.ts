/**
 * @file TapProcessor.ts
 * @description
 * TapProcessor 是处理点击手势的处理器类。它继承自GestureProcessor，
 * 用于检测简单的点击操作，通过验证点击持续时间和移动距离来判断是否构成有效点击。
 *
 * 该处理器记录按下和释放事件，验证持续时间和移动距离是否在约束范围内。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * TapProcessor类
 * 处理点击手势事件，通过时间间隔和位置距离验证判断是否为有效点击
 */
export declare class TapProcessor extends GestureProcessor<'tap'> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'tap'>['constraints'];
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最大时间间隔和最大移动距离
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'tap'>['constraints']);
}
//# sourceMappingURL=TapProcessor.d.ts.map