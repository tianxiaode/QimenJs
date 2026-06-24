"use strict";
/**
 * @file SwipeProcessor.ts
 * @description
 * SwipeProcessor 是处理滑动手势的处理器类。它继承自GestureProcessor，
 * 用于检测快速滑动手势，通过计算移动距离、时间和速度来判断是否构成有效滑动。
 *
 * 该处理器记录按下和移动事件，在释放时验证滑动是否满足最小距离、最大持续时间和最小速度的约束。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwipeProcessor = void 0;
const GestureProcessor_1 = require("./GestureProcessor");
const validation_1 = require("../utils/validation");
/**
 * SwipeProcessor类
 * 处理滑动手势事件，通过距离、时间和速度验证来检测滑动操作
 */
class SwipeProcessor extends GestureProcessor_1.GestureProcessor {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小距离、最大持续时间和最小速度
     */
    constructor(semantic, emit, constraints) {
        super(semantic, emit, constraints);
        this.semantic = semantic;
        this.emit = emit;
        this.constraints = constraints;
        // 定义滑动事件处理器
        this.handlers = {
            press: input => {
                // 按下时开始记录手势
                this.start(input);
            },
            move: input => {
                if (!this.active)
                    return;
                // 移动时更新位置信息
                this.move(input);
            },
            release: input => {
                var _a, _b, _c, _d, _e, _f;
                if (!this.active)
                    return;
                // 获取约束参数或使用默认值
                const minDistance = (_b = (_a = this.constraints) === null || _a === void 0 ? void 0 : _a.minDistance) !== null && _b !== void 0 ? _b : 30; // 默认最小距离30px
                const maxDuration = (_d = (_c = this.constraints) === null || _c === void 0 ? void 0 : _c.maxDuration) !== null && _d !== void 0 ? _d : 1000; // 默认最大持续时间1000ms
                const minVelocity = (_f = (_e = this.constraints) === null || _e === void 0 ? void 0 : _e.minVelocity) !== null && _f !== void 0 ? _f : 0.5; // 默认最小速度0.5px/ms
                // 计算实际持续时间和移动距离
                const duration = this.duration();
                const distance = this.distance();
                // 验证滑动是否满足条件
                if ((0, validation_1.validateSwipe)(distance, duration, minDistance, maxDuration, minVelocity)) {
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
exports.SwipeProcessor = SwipeProcessor;
//# sourceMappingURL=SwipeProcessor.js.map