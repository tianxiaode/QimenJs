/**
 * @file LongPressProcessor.ts
 * @description
 * LongPressProcessor 是处理长按手势的处理器类。它继承自GestureProcessor，
 * 通过计时器检测按下持续时间是否超过最小阈值，并验证在此期间移动距离是否在允许范围内。
 *
 * 该处理器在按下时启动计时器，在移动过程中检查移动距离，若超过范围则取消长按，
 * 在释放或取消时清理计时器。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * LongPressProcessor类
 * 处理长按手势事件，通过计时器和距离验证来检测长按操作
 */
export declare class LongPressProcessor extends GestureProcessor<'longpress'> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'longpress'>['constraints'];
    private timer;
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小持续时间和最大移动距离
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'longpress'>['constraints']);
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
     * 取消长按操作，清理计时器和状态
     */
    private cancel;
}
//# sourceMappingURL=LongPressProcessor.d.ts.map