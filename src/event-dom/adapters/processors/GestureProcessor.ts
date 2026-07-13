/**
 * @file GestureProcessor.ts
 * @description
 * GestureProcessor 是所有手势处理器的基类，提供了手势处理的基础功能。
 * 它定义了手势处理的基本流程，包括记录手势开始位置、移动轨迹、计算距离和时间等。
 *
 * 该基类还提供了日志记录功能，方便调试和监控手势处理过程。
 */

import {
    GestureEventDescriptor,
    GestureSemantic,
    InputSignal,
    GestureEmit,
    GestureInput,
} from '../../types';
import { ILogger, LogLevel, Logger } from '@/logger';
import { string, geometry } from '@/utils';
import { GestureError } from '@/error/GestureError';
import { KernelErrorCode } from '@/error/codes';

/**
 * GestureProcessor抽象类
 * 所有具体手势处理器的基类，提供基础的手势处理功能
 */
export abstract class GestureProcessor<S extends GestureSemantic = GestureSemantic> {
    // 手势事件处理器映射
    protected handlers: Partial<Record<InputSignal, (input: GestureInput) => void>> = {};

    // 标记手势是否处于活动状态
    protected active = false;

    // 记录开始时间和最后时间
    protected startTime = 0;
    protected lastTime = 0;

    // 记录开始位置和最后位置
    protected startX = 0;
    protected startY = 0;
    protected lastX = 0;
    protected lastY = 0;

    // 处理器实例ID和日志记录器
    private readonly processorId = string.getId('gesture-processor');
    private readonly logger: ILogger;

    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<S>['constraints']
    ) {
        this.logger = Logger.for(`gesture.${this.semantic}`);
    }

    /**
     * 内置日志方法
     * @param level - 日志级别
     * @param action - 操作名称
     * @param data - 附加数据
     */
    protected logProcessor(level: LogLevel, action: string, data?: Record<string, any>) {
        this.logger[level](`[gesture.processor] ${action}`, {
            processorId: this.processorId,
            semantic: this.semantic,
            ...data,
        });
    }

    /**
     * 处理手势输入
     * @param input - 手势输入信息
     */
    handle(input: GestureInput): void {
        this.logProcessor('debug', 'input_received', {
            signal: input.signal,
            x: input.x,
            y: input.y,
            time: input.time,
        });

        this.lastTime = input.time;
        this.handlers[input.signal]?.(input);
    }

    /**
     * 开始手势处理
     * @param input - 手势输入信息
     */
    protected start(input: GestureInput) {
        // 使用 Number.isFinite 替代不存在的 assert.finite
        if (input.x == null || !Number.isFinite(input.x)) {
            throw new GestureError(
                'x must be a finite number',
                KernelErrorCode.GESTURE_RECOGNITION_ERROR,
                {
                    processor: this.constructor.name,
                    semantic: this.semantic,
                    inputValue: input.x,
                }
            );
        }
        if (input.y == null || !Number.isFinite(input.y)) {
            throw new GestureError(
                'y must be a finite number',
                KernelErrorCode.GESTURE_RECOGNITION_ERROR,
                {
                    processor: this.constructor.name,
                    semantic: this.semantic,
                    inputValue: input.y,
                }
            );
        }

        const x = input.x;
        const y = input.y;

        this.active = true;
        this.startTime = input.time;

        this.startX = this.lastX = x;
        this.startY = this.lastY = y;

        this.logProcessor('debug', 'gesture_started', {
            x,
            y,
            time: input.time,
        });
    }

    /**
     * 移动手势处理
     * @param input - 手势输入信息
     */
    protected move(input: GestureInput) {
        if (input.x != null && Number.isFinite(input.x)) {
            this.lastX = input.x;
        }
        if (input.y != null && Number.isFinite(input.y)) {
            this.lastY = input.y;
        }

        this.logProcessor('debug', 'gesture_moved', {
            lastX: this.lastX,
            lastY: this.lastY,
        });
    }

    /**
     * 结束手势处理
     */
    protected end() {
        this.logProcessor('debug', 'gesture_ended', {
            duration: this.duration(),
            distance: this.distance(),
        });

        this.reset();
    }

    /**
     * 重置手势状态
     */
    protected reset() {
        this.active = false;
        this.startTime = 0;

        this.logProcessor('debug', 'gesture_reset');
    }

    /**
     * 计算手势持续时间
     * @returns 手势持续时间（毫秒）
     */
    protected duration(): number {
        return this.lastTime - this.startTime;
    }

    /**
     * 计算手势移动距离
     * @returns 手势移动距离（像素）
     */
    protected distance(): number {
        return geometry.distance(
            { x: this.startX, y: this.startY },
            { x: this.lastX, y: this.lastY }
        );
    }

    /**
     * 触发手势事件
     * @param originalEvent - 原始事件对象
     */
    protected emitGesture(originalEvent?: Event) {
        this.emit({
            semantic: this.semantic,
            originalEvent,
        });
    }
}
