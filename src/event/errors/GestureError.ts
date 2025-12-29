import { ErrorBase } from '../../error/BaseError';

/**
 * 🖱️ 手势事件处理错误类
 * 
 * 用于处理与手势识别和处理相关的错误
 * 继承自基础错误类 ErrorBase，提供统一的错误处理机制
 * 
 * @example
 * ```ts
 * try {
 *   // 手势处理逻辑
 *   handleGesture(event);
 * } catch (error) {
 *   throw new GestureError('手势识别失败', {
 *     gestureType: 'swipe',
 *     targetElement: event.target,
 *     position: { x: event.clientX, y: event.clientY }
 *   });
 * }
 * ```
 */
export class GestureError extends ErrorBase {
  /**
   * 构造函数
   * 
   * @param message - 错误消息，描述具体的错误原因
   * @param context - 可选参数，提供与错误相关的上下文信息
   * 
   * @example
   * ```ts
   * const error = new GestureError('无法识别手势类型');
   * 
   * const errorWithCtx = new GestureError('滑动距离不足', {
   *   minDistance: 50,
   *   actualDistance: 30,
   *   startPosition: { x: 10, y: 20 },
   *   endPosition: { x: 25, y: 35 }
   * });
   * ```
   */
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 'GESTURE_ERROR', context);
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, GestureError.prototype);
  }
}