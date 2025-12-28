import { ErrorBase } from '../../error/BaseError';

/**
 * 手势处理错误类
 */
export class GestureError extends ErrorBase {
  constructor(
    message: string,
    context?: Record<string, any>
  ) {
    super(message, 'GESTURE_ERROR', context);
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, GestureError.prototype);
  }
}