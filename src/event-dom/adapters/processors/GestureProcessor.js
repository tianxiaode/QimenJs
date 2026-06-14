"use strict";
/**
 * @file GestureProcessor.ts
 * @description
 * GestureProcessor 是所有手势处理器的基类，提供了手势处理的基础功能。
 * 它定义了手势处理的基本流程，包括记录手势开始位置、移动轨迹、计算距离和时间等。
 *
 * 该基类还提供了日志记录功能，方便调试和监控手势处理过程。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GestureProcessor = void 0;
const logger_1 = require("@orbitjs/logger");
const utils_1 = require("@orbitjs/utils");
const errors_1 = require("../../../kernel/errors");
/**
 * GestureProcessor抽象类
 * 所有具体手势处理器的基类，提供基础的手势处理功能
 */
class GestureProcessor {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(semantic, emit, constraints) {
        this.semantic = semantic;
        this.emit = emit;
        this.constraints = constraints;
        // 手势事件处理器映射
        this.handlers = {};
        // 标记手势是否处于活动状态
        this.active = false;
        // 记录开始时间和最后时间
        this.startTime = 0;
        this.lastTime = 0;
        // 记录开始位置和最后位置
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        // 处理器实例ID和日志记录器
        this.processorId = utils_1.string.getId('gesture-processor');
        this.logger = logger_1.Logger.for(`gesture.${this.semantic}`);
    }
    /**
     * 内置日志方法
     * @param level - 日志级别
     * @param action - 操作名称
     * @param data - 附加数据
     */
    logProcessor(level, action, data) {
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
    handle(input) {
        var _a, _b;
        this.logProcessor('debug', 'input_received', {
            signal: input.signal,
            x: input.x,
            y: input.y,
            time: input.time,
        });
        this.lastTime = input.time;
        (_b = (_a = this.handlers)[input.signal]) === null || _b === void 0 ? void 0 : _b.call(_a, input);
    }
    /**
     * 开始手势处理
     * @param input - 手势输入信息
     */
    start(input) {
        // 使用 Number.isFinite 替代不存在的 assert.finite
        if (input.x == null || !Number.isFinite(input.x)) {
            throw new errors_1.GestureError('x must be a finite number', errors_1.KernelErrorCode.GESTURE_RECOGNITION_ERROR, {
                processor: this.constructor.name,
                semantic: this.semantic,
                inputValue: input.x,
            });
        }
        if (input.y == null || !Number.isFinite(input.y)) {
            throw new errors_1.GestureError('y must be a finite number', errors_1.KernelErrorCode.GESTURE_RECOGNITION_ERROR, {
                processor: this.constructor.name,
                semantic: this.semantic,
                inputValue: input.y,
            });
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
    move(input) {
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
    end() {
        this.logProcessor('debug', 'gesture_ended', {
            duration: this.duration(),
            distance: this.distance(),
        });
        this.reset();
    }
    /**
     * 重置手势状态
     */
    reset() {
        this.active = false;
        this.startTime = 0;
        this.logProcessor('debug', 'gesture_reset');
    }
    /**
     * 计算手势持续时间
     * @returns 手势持续时间（毫秒）
     */
    duration() {
        return this.lastTime - this.startTime;
    }
    /**
     * 计算手势移动距离
     * @returns 手势移动距离（像素）
     */
    distance() {
        return utils_1.geometry.distance({ x: this.startX, y: this.startY }, { x: this.lastX, y: this.lastY });
    }
    /**
     * 触发手势事件
     * @param originalEvent - 原始事件对象
     */
    emitGesture(originalEvent) {
        this.logProcessor('info', 'gesture_emitted', { semantic: this.semantic });
        this.emit({
            semantic: this.semantic,
            originalEvent,
        });
    }
}
exports.GestureProcessor = GestureProcessor;
//# sourceMappingURL=GestureProcessor.js.map