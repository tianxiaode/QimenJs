import { BaseError } from "../../error";
import { ValidationResult } from './types';

export class ValidationError extends BaseError {
  /**
   * 验证结果详情
   */
  public readonly validationResult: ValidationResult;

  constructor(
    validationResult: ValidationResult,
    code: string | number = 'VALIDATION_ERROR',
    message?: string,
    context?: Record<string, any>
  ) {
    // 优先使用传入的 message，否则使用 validationResult 中的第一个错误信息
    const errorMessage = 
      message || 
      (validationResult.errors.length > 0 
        ? validationResult.errors[0].errorMessage 
        : 'Validation failed');
    
    super(errorMessage || '', code, context);
    this.name = 'ValidationError';
    this.validationResult = validationResult;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * 获取所有错误代码
   */
  public getErrorCodes(): string[] {
    return this.validationResult.errors.map(error => error.errorCode);
  }

  /**
   * 获取格式化后的错误信息（UI友好）
   */
  public getFormattedErrors(): string[] {
    return this.validationResult.errors.map(error => {
      // 这里可以调用您的格式化函数
      return error.errorMessage || error.errorCode;
    });
  }

  /**
   * 转换为 JSON 格式（包含验证详情）
   */
  public override toJSON(): Record<string, any> {
    const baseJson = super.toJSON();
    return {
      ...baseJson,
      validationResult: {
        isValid: this.validationResult.isValid,
        errors: this.validationResult.errors
      }
    };
  }
}