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
import { validateDoubleTap } from '../utils/validation';

/**
 * DoubleTapProcessor类
 * 处理双击手势事件，通过时间间隔和位置距离验证判断是否为有效双击
 */
export class DoubleTapProcessor extends GestureProcessor<'dblclick'> {
    // 记录上一次点击的时间和位置
    private lastTapTime = 0;
    private lastTapX = 0;
    private lastTapY = 0;

    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最大时间间隔和最大距离
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'dblclick'>['constraints']
    ) {
        super(semantic, emit, constraints);

        this.handlers = {
            press: input => {
                const now = input.time;
                // 默认最大时间间隔为300ms
                const maxInterval = this.constraints?.maxInterval ?? 300;
                // 默认最大距离为10px
                const maxDistance = this.constraints?.maxDistance ?? 10;

                this.logProcessor('debug', 'doubletap_check', {
                    currentTime: now,
                    lastTapTime: this.lastTapTime,
                    currentX: input.x ?? 0,
                    currentY: input.y ?? 0,
                    lastTapX: this.lastTapX,
                    lastTapY: this.lastTapY,
                    maxInterval,
                    maxDistance,
                    timeDiff: now - this.lastTapTime,
                });

                // 验证是否满足双击条件
                if (
                    validateDoubleTap(
                        now,
                        this.lastTapTime,
                        input.x ?? 0,
                        input.y ?? 0,
                        this.lastTapX,
                        this.lastTapY,
                        maxInterval,
                        maxDistance
                    )
                ) {
                    // 检测到双击，触发事件
                    this.emitGesture(input.originalEvent);
                    this.resetDoubleTap();

                    this.logProcessor('debug', 'doubletap_detected', {
                        timeDiff: now - this.lastTapTime,
                        distance: Math.sqrt(
                            Math.pow((input.x ?? 0) - this.lastTapX, 2) +
                                Math.pow((input.y ?? 0) - this.lastTapY, 2)
                        ),
                    });
                }

                // 记录本次点击
                this.lastTapTime = now;
                this.lastTapX = input.x ?? 0;
                this.lastTapY = input.y ?? 0;

                this.logProcessor('debug', 'doubletap_recorded', {
                    recordedTime: now,
                    recordedX: this.lastTapX,
                    recordedY: this.lastTapY,
                });
            },
        };
    }

    /**
     * 重置双击状态
     */
    private resetDoubleTap() {
        // 重置双击状态
        this.lastTapTime = 0;

        this.logProcessor('debug', 'doubletap_reset', {
            message: 'Double tap state has been reset',
        });
    }
}