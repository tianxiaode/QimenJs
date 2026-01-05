/**
 * @file LongPressProcessor.ts
 * @description
 * LongPressProcessor 是处理长按手势的处理器类。它继承自GestureProcessor，
 * 通过计时器检测按下持续时间是否超过最小阈值，并验证在此期间移动距离是否在允许范围内。
 * 
 * 该处理器在按下时启动计时器，在移动过程中检查移动距离，若超过范围则取消长按，
 * 在释放或取消时清理计时器。
 */

import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';
import { validateLongPress } from '../utils/validation';
import { time } from '@orbitjs/utils';

/**
 * LongPressProcessor类
 * 处理长按手势事件，通过计时器和距离验证来检测长按操作
 */
export class LongPressProcessor extends GestureProcessor<'longpress'> {
    // 计时器对象，用于处理延时操作
    private timer: time.Cancelable | null = null;

    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小持续时间和最大移动距离
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'longpress'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义长按事件处理器
        this.handlers = {
            press: this.onPress,      // 按下时启动计时器
            move: this.onMove,        // 移动时检查是否超出距离限制
            release: this.cancel,     // 释放时取消计时器
            cancel: this.cancel,      // 取消时清理状态
        };
    }

    /**
     * 按下事件处理
     * @param input - 手势输入信息
     */
    private onPress = (input: GestureInput) => {
        this.start(input);

        // 获取最小持续时间和最大移动距离（约束或默认值）
        const minDuration = this.constraints?.minDuration ?? 500; // 默认500ms
        const maxDistance = this.constraints?.maxDistance ?? 10;  // 默认10px

        // 设置计时器，在指定时间后检查是否满足长按条件
        this.timer = time.after(minDuration, () => {
            if (
                this.active &&
                validateLongPress(this.startX, this.startY, this.lastX, this.lastY, maxDistance)
            ) {
                // 满足长按条件，触发手势事件
                this.emitGesture(input.originalEvent);
                this.reset();
            }
        });

        this.logProcessor('debug', 'longpress_start', {
            minDuration,
            maxDistance,
        });
    };

    /**
     * 移动事件处理
     * @param input - 手势输入信息
     */
    private onMove = (input: GestureInput) => {
        if (!this.active) return;

        this.move(input);

        // 获取最大移动距离（约束或默认值）
        const maxDistance = this.constraints?.maxDistance ?? 10;

        // 验证当前位置是否仍在允许范围内
        const isValid = validateLongPress(
            this.startX,
            this.startY,
            this.lastX,
            this.lastY,
            maxDistance
        );

        this.logProcessor('debug', 'longpress_move', {
            maxDistance,
            isValid,
        });

        // 如果超出允许范围，取消长按
        if (!isValid) {
            this.cancel();
        }
    };

    /**
     * 取消长按操作，清理计时器和状态
     */
    private cancel = () => {
        if (this.timer) {
            this.timer.cancel();
            this.timer = null;
        }
        this.reset();
    };
}