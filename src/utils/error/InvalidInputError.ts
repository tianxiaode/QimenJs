import { BaseError } from './BaseError';

/**
 * 🎯 无效输入错误
 * 当输入参数不符合预期时抛出
 */
export class InvalidInputError extends BaseError {
  constructor(
    message: string,
    options: {
      field?: string;
      value?: any;
      expected?: any;
      code?: string | number;
    } = {}
  ) {
    const context: Record<string, any> = {};
    
    if (options.field) context.field = options.field;
    if (options.value !== undefined) context.value = options.value;
    if (options.expected !== undefined) context.expected = options.expected;
    
    super(message, {
      name: 'InvalidInputError',
      code: options.code || 'INVALID_INPUT',
      context
    });
  }
  
  /**
   * 快速创建字段验证错误
   */
  static forField(field: string, message: string, value?: any): InvalidInputError {
    return new InvalidInputError(`${field}: ${message}`, {
      field,
      value
    });
  }
  
  /**
   * 创建类型错误
   */
  static forType(field: string, expected: string, actual: any): InvalidInputError {
    return new InvalidInputError(
      `${field} must be ${expected}, got ${typeof actual}`,
      { field, expected, value: actual }
    );
  }
  
  /**
   * 创建范围错误
   */
  static forRange(
    field: string,
    min?: number,
    max?: number,
    actual?: number
  ): InvalidInputError {
    let message = `${field} is out of range`;
    let expected = '';
    
    if (min !== undefined && max !== undefined) {
      expected = `between ${min} and ${max}`;
    } else if (min !== undefined) {
      expected = `at least ${min}`;
    } else if (max !== undefined) {
      expected = `at most ${max}`;
    }
    
    if (expected) {
      message = `${message} (expected ${expected})`;
    }
    
    return new InvalidInputError(message, {
      field,
      value: actual,
      expected
    });
  }
}