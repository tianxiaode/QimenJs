/**
 * @qimenjs/event-dom
 *
 * DOM事件处理包 - 提供DOM元素事件绑定、手势识别、事件转换等功能
 *
 * 该包依赖于 @qimenjs/event 核心事件系统，提供：
 * - DOM事件适配器（DomEventAdapter）
 * - 手势处理器（Tap, Swipe, Drag, LongPress等）
 * - 语义化事件映射
 * - 事件验证工具
 *
 * @example
 * ```ts
 * import { createEventAdapter } from '@qimenjs/event-dom';
 *
 * const adapter = createEventAdapter();
 * adapter.bind(element, 'tap', handler);
 * ```
 */

export * from './adapters';
export * from './types';
