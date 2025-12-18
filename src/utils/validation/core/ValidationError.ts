import { BaseError } from "../../error";
/**
 * 🎯 验证错误
 * 数据验证失败时抛出
 */
export class ValidationError extends BaseError {
  public readonly errors: Array<{ field: string; message: string }>;
  
  constructor(
    message: string,
    code: string | number = 'VALIDATION_FAILED',
    errors: Array<any> = [],
    context?: Record<string, any>
  ) {
    // 将 errors 添加到上下文中
    const extendedContext = context ? { ...context, errors } : { errors };
    
    super(message, code, extendedContext);
    this.name = 'ValidationError';
    this.errors = errors;
  }
  
  /**
   * 添加错误详情
   */
  addError(field: string, message: string): this {
    this.errors.push({ field, message });
    // 同步更新上下文中的 errors
    if (this.context) {
      this.context.errors = this.errors;
    }
    return this;
  }
  
  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  /**
   * 转换为简化的错误对象
   */
  toSimpleObject(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
    this.errors.forEach(error => {
      if (!result[error.field]) {
        result[error.field] = [];
      }
      result[error.field].push(error.message);
    });
    
    return result;
  }
}