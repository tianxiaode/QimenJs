/**
 * @file factory.ts
 * @description
 * 手势处理器工厂模块，提供创建各种手势处理器的工厂函数。
 *
 * 该模块定义了一个工厂函数createGestureProcessor，可以根据传入的手势描述符
 * 创建对应类型的手势处理器实例。通过processorRegistry映射将处理器名称
 * 与具体的处理器类关联起来。
 */
import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../types';
import { GestureProcessor } from './GestureProcessor';
/**
 * 手势处理器工厂函数类型定义
 * 根据手势描述符和事件发射函数创建对应的手势处理器
 */
export type GestureProcessorFactory = <S extends GestureSemantic>(descriptor: GestureEventDescriptor<S>, emit: (event: GestureEmit) => void) => GestureProcessor<S>;
/**
 * 创建手势处理器的工厂函数
 * 根据传入的手势描述符创建对应的手势处理器实例
 *
 * @param descriptor - 手势描述符，包含语义、处理器类型和约束条件
 * @param emit - 用于发送手势事件的函数
 * @returns 对应的手势处理器实例
 * @throws {GestureError} 当指定的处理器类型不存在时抛出错误
 */
export declare function createGestureProcessor<S extends GestureSemantic>(descriptor: GestureEventDescriptor<S>, emit: (event: GestureEmit) => void): GestureProcessor<S>;
//# sourceMappingURL=factory.d.ts.map