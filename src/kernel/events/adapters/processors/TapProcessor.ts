/**
 * @file TapProcessor.ts
 * @description
 * TapProcessor 是处理点击手势的处理器类。它继承自GestureProcessor，
 * 用于检测简单的点击操作，通过验证点击持续时间和移动距离来判断是否构成有效点击。
 * 
 * 该处理器记录按下和释放事件，验证持续时间和移动距离是否在约束范围内。
 */

import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';
import { validateTap } from '../utils/validation';

/**
 * TapProcessor类
 * 处理点击手势事件，通过时间间隔和位置距离验证判断是否为有效点击
 */
export class TapProcessor extends GestureProcessor<'tap'> {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最大时间间隔和最大移动距离
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'tap'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义点击事件处理器
        this.handlers = {
            press: input => {
                // 按下时开始记录
                this.start(input);
            },
            move: input => {
                if (!this.active) return;

                // 移动时更新位置信息
                this.move(input);
            },
            release: input => {
                // 计算持续时间和移动距离
                const duration = this.duration();
                const distance = this.distance();
                
                // 获取约束参数或使用默认值
                const maxDistance = this.constraints?.maxDistance ?? 10;   // 默认最大移动距离10px
                const maxDuration = this.constraints?.maxDuration ?? 250;  // 默认最大持续时间250ms
                
                // 验证点击是否有效
                const isValid = validateTap(duration, distance, maxDuration, maxDistance);
                
                if (this.active && isValid) {
                    // 有效点击，触发手势事件
                    this.emitGesture(input.originalEvent);
                }

                // 结束手势处理
                this.end();
            },
            cancel: () => this.reset(),  // 取消时重置状态
        };
    }
}