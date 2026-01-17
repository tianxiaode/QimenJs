import { KernelError } from './KernelError';
import { KernelErrorCode } from './codes';

/**
 * 🖱️ 手势事件处理错误类
 * 
 * 用于处理与手势识别和处理相关的错误
 * 继承自KernelError，提供统一的错误处理机制
 * 
 * @example
 * ```ts
 * try {
 *   // 手势处理逻辑
 *   handleGesture(event);
 * } catch (error) {
 *   throw new GestureError('手势识别失败', KernelErrorCode.GESTURE_RECOGNITION_ERROR, {
 *     gestureType: 'swipe',
 *     targetElement: event.target,
 *     position: { x: event.clientX, y: event.clientY }
 *   });
 * }
 * ```
 */
export class GestureError extends KernelError {
  /**
   * 构造函数
   * 
   * @param message - 错误消息，描述具体的错误原因
   * @param code - 错误代码
   * @param context - 可选参数，提供与错误相关的上下文信息
   * 
   * @example
   * ```ts
   * const error = new GestureError('无法识别手势类型', KernelErrorCode.GESTURE_RECOGNITION_ERROR);
   * 
   * const errorWithCtx = new GestureError('滑动距离不足', KernelErrorCode.GESTURE_DISTANCE_INSUFFICIENT, {
   *   minDistance: 50,
   *   actualDistance: 30,
   *   startPosition: { x: 10, y: 20 },
   *   endPosition: { x: 25, y: 35 }
   * });
   * ```
   */
  constructor(
    message: string,
    code: KernelErrorCode,
    context?: Record<string, any>
  ) {
    super(message, code, context);
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, GestureError.prototype);
  }
}