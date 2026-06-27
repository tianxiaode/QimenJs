"use strict";
/**
 * @file factory.ts
 * @description
 * 手势处理器工厂模块，提供创建各种手势处理器的工厂函数。
 *
 * 该模块定义了一个工厂函数createGestureProcessor，可以根据传入的手势描述符
 * 创建对应类型的手势处理器实例。通过processorRegistry映射将处理器名称
 * 与具体的处理器类关联起来。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGestureProcessor = createGestureProcessor;
const TapProcessor_1 = require("./TapProcessor");
const DragProcessor_1 = require("./DragProcessor");
const LongPressProcessor_1 = require("./LongPressProcessor");
const DoubleTapProcessor_1 = require("./DoubleTapProcessor");
const SwipeProcessor_1 = require("./SwipeProcessor");
const HoverProcessor_1 = require("./HoverProcessor");
const ContextMenuProcessor_1 = require("./ContextMenuProcessor");
const SubmitProcessor_1 = require("./SubmitProcessor");
const GestureError_1 = require("@/error/GestureError"); // 导入新错误类
const codes_1 = require("@/error/codes"); // 导入错误代码
/**
 * 处理器注册表，将处理器名称映射到对应的构造函数
 * 包含了各种手势处理器的构造函数
 */
const processorRegistry = {
    tapProcessor: TapProcessor_1.TapProcessor,
    doubleTapProcessor: DoubleTapProcessor_1.DoubleTapProcessor,
    longPressProcessor: LongPressProcessor_1.LongPressProcessor,
    panProcessor: DragProcessor_1.DragProcessor, // ✅ 修正：drag 使用 panProcessor
    swipeProcessor: SwipeProcessor_1.SwipeProcessor,
    hoverProcessor: HoverProcessor_1.HoverProcessor,
    contextMenuProcessor: ContextMenuProcessor_1.ContextMenuProcessor,
    enterKeyProcessor: SubmitProcessor_1.SubmitProcessor, // ✅ 修正：submit 使用 enterKeyProcessor
};
/**
 * 创建手势处理器的工厂函数
 * 根据传入的手势描述符创建对应的手势处理器实例
 *
 * @param descriptor - 手势描述符，包含语义、处理器类型和约束条件
 * @param emit - 用于发送手势事件的函数
 * @returns 对应的手势处理器实例
 * @throws {GestureError} 当指定的处理器类型不存在时抛出错误
 */
function createGestureProcessor(descriptor, emit) {
    // 获取处理器键名
    const processorKey = descriptor.processor;
    // 获取对应的处理器构造函数
    const ProcessorCtor = processorRegistry[processorKey];
    // 如果没有找到对应的处理器构造函数，抛出错误
    if (!ProcessorCtor) {
        throw new GestureError_1.GestureError(`Unknown gesture processor: ${descriptor.processor}`, codes_1.KernelErrorCode.UNKNOWN_GESTURE_PROCESSOR, {
            processor: descriptor.processor,
            semantic: descriptor.semantic,
        });
    }
    // 创建并返回处理器实例
    return new ProcessorCtor(descriptor.semantic, emit, descriptor.constraints);
}
//# sourceMappingURL=factory.js.map