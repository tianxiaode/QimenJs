/**
 * @file SwipeProcessor.ts
 * @description
 * SwipeProcessor 是处理滑动手势的处理器类。它继承自GestureProcessor，
 * 用于检测快速滑动手势，通过计算移动距离、时间和速度来判断是否构成有效滑动。
 *
 * 该处理器记录按下和移动事件，在释放时验证滑动是否满足最小距离、最大持续时间和最小速度的约束。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * SwipeProcessor类
 * 处理滑动手势事件，通过距离、时间和速度验证来检测滑动操作
 */
export declare class SwipeProcessor extends GestureProcessor<'swipe'> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<'swipe'>['constraints'];
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小距离、最大持续时间和最小速度
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<'swipe'>['constraints']);
}
//# sourceMappingURL=SwipeProcessor.d.ts.map