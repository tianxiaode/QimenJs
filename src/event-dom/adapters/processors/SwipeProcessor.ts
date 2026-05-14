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
import { validateSwipe } from '../utils/validation';

/**
 * SwipeProcessor类
 * 处理滑动手势事件，通过距离、时间和速度验证来检测滑动操作
 */
export class SwipeProcessor extends GestureProcessor<'swipe'> {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小距离、最大持续时间和最小速度
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'swipe'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义滑动事件处理器
        this.handlers = {
            press: input => {
                // 按下时开始记录手势
                this.start(input);
            },
            move: input => {
                if (!this.active) return;

                // 移动时更新位置信息
                this.move(input);
            },
            release: input => {
                if (!this.active) return;

                // 获取约束参数或使用默认值
                const minDistance = this.constraints?.minDistance ?? 30; // 默认最小距离30px
                const maxDuration = this.constraints?.maxDuration ?? 1000; // 默认最大持续时间1000ms
                const minVelocity = this.constraints?.minVelocity ?? 0.5; // 默认最小速度0.5px/ms

                // 计算实际持续时间和移动距离
                const duration = this.duration();
                const distance = this.distance();

                // 验证滑动是否满足条件
                if (validateSwipe(distance, duration, minDistance, maxDuration, minVelocity)) {
                    // 满足条件，触发滑动手势事件
                    this.emitGesture(input.originalEvent);
                }

                this.logProcessor('debug', 'gesture_ended', {
                    duration,
                    distance,
                    minDistance,
                    maxDuration,
                    minVelocity,
                });

                // 重置手势状态
                this.reset();
            },
            cancel: () => {
                // 取消时重置状态
                this.reset();
            },
        };
    }
}
