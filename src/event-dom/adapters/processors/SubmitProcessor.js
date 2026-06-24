"use strict";
/**
 * @file SubmitProcessor.ts
 * @description
 * SubmitProcessor 是处理提交事件的处理器类。它继承自GestureProcessor，
 * 用于处理表单提交或其他提交操作的事件。
 *
 * 该处理器监听submit信号并触发相应的语义事件。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitProcessor = void 0;
const GestureProcessor_1 = require("./GestureProcessor");
/**
 * SubmitProcessor类
 * 处理提交事件，例如表单提交
 */
class SubmitProcessor extends GestureProcessor_1.GestureProcessor {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(semantic, emit, constraints) {
        super(semantic, emit, constraints);
        this.semantic = semantic;
        this.emit = emit;
        this.constraints = constraints;
        // 定义提交事件处理器
        this.handlers = {
            submit: i => {
                // 当收到提交信号时，触发相应的手势事件
                this.emitGesture(i.originalEvent);
            },
        };
    }
}
exports.SubmitProcessor = SubmitProcessor;
//# sourceMappingURL=SubmitProcessor.js.map