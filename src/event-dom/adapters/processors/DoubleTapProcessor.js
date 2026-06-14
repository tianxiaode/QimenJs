"use strict";
/**
 * @file DoubleTapProcessor.ts
 * @description
 * DoubleTapProcessor 是处理双击手势的处理器类。它继承自GestureProcessor，
 * 通过记录两次点击的时间和位置来判断是否构成双击事件。
 *
 * 该处理器验证两次点击之间的时间间隔和位置距离是否在约束范围内，
 * 以确定是否触发双击语义事件。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleTapProcessor = void 0;
const GestureProcessor_1 = require("./GestureProcessor");
const validation_1 = require("../utils/validation");
/**
 * DoubleTapProcessor类
 * 处理双击手势事件，通过时间间隔和位置距离验证判断是否为有效双击
 */
class DoubleTapProcessor extends GestureProcessor_1.GestureProcessor {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最大时间间隔和最大距离
     */
    constructor(semantic, emit, constraints) {
        super(semantic, emit, constraints);
        this.semantic = semantic;
        this.emit = emit;
        this.constraints = constraints;
        // 记录上一次点击的时间和位置
        this.lastTapTime = 0;
        this.lastTapX = 0;
        this.lastTapY = 0;
        this.handlers = {
            press: input => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                const now = input.time;
                // 默认最大时间间隔为300ms
                const maxInterval = (_b = (_a = this.constraints) === null || _a === void 0 ? void 0 : _a.maxInterval) !== null && _b !== void 0 ? _b : 300;
                // 默认最大距离为10px
                const maxDistance = (_d = (_c = this.constraints) === null || _c === void 0 ? void 0 : _c.maxDistance) !== null && _d !== void 0 ? _d : 10;
                this.logProcessor('debug', 'doubletap_check', {
                    currentTime: now,
                    lastTapTime: this.lastTapTime,
                    currentX: (_e = input.x) !== null && _e !== void 0 ? _e : 0,
                    currentY: (_f = input.y) !== null && _f !== void 0 ? _f : 0,
                    lastTapX: this.lastTapX,
                    lastTapY: this.lastTapY,
                    maxInterval,
                    maxDistance,
                    timeDiff: now - this.lastTapTime,
                });
                // 验证是否满足双击条件
                if ((0, validation_1.validateDoubleTap)(now, this.lastTapTime, (_g = input.x) !== null && _g !== void 0 ? _g : 0, (_h = input.y) !== null && _h !== void 0 ? _h : 0, this.lastTapX, this.lastTapY, maxInterval, maxDistance)) {
                    // 检测到双击，触发事件
                    this.emitGesture(input.originalEvent);
                    this.resetDoubleTap();
                    this.logProcessor('debug', 'doubletap_detected', {
                        timeDiff: now - this.lastTapTime,
                        distance: Math.sqrt(Math.pow(((_j = input.x) !== null && _j !== void 0 ? _j : 0) - this.lastTapX, 2) +
                            Math.pow(((_k = input.y) !== null && _k !== void 0 ? _k : 0) - this.lastTapY, 2)),
                    });
                }
                // 记录本次点击
                this.lastTapTime = now;
                this.lastTapX = (_l = input.x) !== null && _l !== void 0 ? _l : 0;
                this.lastTapY = (_m = input.y) !== null && _m !== void 0 ? _m : 0;
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
    resetDoubleTap() {
        // 重置双击状态
        this.lastTapTime = 0;
        this.logProcessor('debug', 'doubletap_reset', {
            message: 'Double tap state has been reset',
        });
    }
}
exports.DoubleTapProcessor = DoubleTapProcessor;
//# sourceMappingURL=DoubleTapProcessor.js.map