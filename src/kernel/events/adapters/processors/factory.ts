/**
 * @file factory.ts
 * @description
 * 手势处理器工厂模块，提供创建各种手势处理器的工厂函数。
 *
 * 该模块定义了一个工厂函数createGestureProcessor，可以根据传入的手势描述符
 * 创建对应类型的手势处理器实例。通过processorRegistry映射将处理器名称
 * 与具体的处理器类关联起来。
 */

import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../../../types';
import { GestureProcessor } from './GestureProcessor';
import { TapProcessor } from './TapProcessor';
import { DragProcessor } from './DragProcessor';
import { LongPressProcessor } from './LongPressProcessor';
import { DoubleTapProcessor } from './DoubleTapProcessor';
import { SwipeProcessor } from './SwipeProcessor';
import { HoverProcessor } from './HoverProcessor';
import { ContextMenuProcessor } from './ContextMenuProcessor';
import { SubmitProcessor } from './SubmitProcessor';
import { GestureError } from '../../errors/GestureError'; // 导入新错误类

/**
 * 手势处理器工厂函数类型定义
 * 根据手势描述符和事件发射函数创建对应的手势处理器
 */
export type GestureProcessorFactory = <S extends GestureSemantic>(
    descriptor: GestureEventDescriptor<S>,
    emit: (event: GestureEmit) => void
) => GestureProcessor<S>;

/**
 * 处理器注册表，将处理器名称映射到对应的构造函数
 * 包含了各种手势处理器的构造函数
 */
const processorRegistry = {
    tapProcessor: TapProcessor,
    doubleTapProcessor: DoubleTapProcessor,
    longPressProcessor: LongPressProcessor,
    panProcessor: DragProcessor, // ✅ 修正：drag 使用 panProcessor
    swipeProcessor: SwipeProcessor,
    hoverProcessor: HoverProcessor,
    contextMenuProcessor: ContextMenuProcessor,
    enterKeyProcessor: SubmitProcessor, // ✅ 修正：submit 使用 enterKeyProcessor
} as const;

/**
 * 创建手势处理器的工厂函数
 * 根据传入的手势描述符创建对应的手势处理器实例
 *
 * @param descriptor - 手势描述符，包含语义、处理器类型和约束条件
 * @param emit - 用于发送手势事件的函数
 * @returns 对应的手势处理器实例
 * @throws {GestureError} 当指定的处理器类型不存在时抛出错误
 */
export function createGestureProcessor<S extends GestureSemantic>(
    descriptor: GestureEventDescriptor<S>,
    emit: (event: GestureEmit) => void
): GestureProcessor<S> {
    // 获取处理器键名
    const processorKey = descriptor.processor as keyof typeof processorRegistry;
    // 获取对应的处理器构造函数
    const ProcessorCtor = processorRegistry[processorKey];

    // 如果没有找到对应的处理器构造函数，抛出错误
    if (!ProcessorCtor) {
        throw new GestureError(`Unknown gesture processor: ${descriptor.processor}`, {
            processor: descriptor.processor,
            semantic: descriptor.semantic,
        });
    }

    // 创建并返回处理器实例
    return new ProcessorCtor(descriptor.semantic, emit, descriptor.constraints);
}
