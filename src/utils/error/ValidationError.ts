import { BaseError } from './BaseError';

/**
 * 🎯 验证错误
 * 数据验证失败时抛出
 */
export class ValidationError extends BaseError {
  public readonly errors: Array<{ field: string; message: string }>;
  
  constructor(
    message: string,
    errors: Array<{ field: string; message: string }> = [],
    options: {
      code?: string | number;
      context?: Record<string, any>;
    } = {}
  ) {
    super(message, {
      name: 'ValidationError',
      code: options.code || 'VALIDATION_FAILED',
      context: { ...options.context, errors }
    });
    
    this.errors = errors;
  }
  
  /**
   * 添加错误详情
   */
  addError(field: string, message: string): this {
    this.errors.push({ field, message });
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