import { EntityError } from "./EntityError";
import { KernelErrorCode } from "./codes";

/**
 * 实体获取错误类
 * 
 * 用于处理实体获取过程中的错误
 * 继承自EntityError，提供实体获取特定的错误处理
 */
export class EntityFetchError extends EntityError {
  /**
   * 构造函数
   * 
   * @param message - 错误描述信息
   * @param code - 错误代码
   * @param context - 可选的上下文信息
   */
  constructor(message: string,  context?: Record<string, any>) {
    const code = KernelErrorCode.ENTITY_FETCH_FAILED;
    super(message, code, context);
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, EntityFetchError.prototype);
  }
}