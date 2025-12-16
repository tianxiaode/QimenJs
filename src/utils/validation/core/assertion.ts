import { ValidationResult } from './types';
import { getValidationFormattedMessage } from './message-handler'
import { ValidationError } from './ValidationError'

/**
 * 断言验证结果是否有效，如果无效则抛出 ValidationError 异常
 * @param validationResult 验证结果
 * @param context 上下文信息
 */
export function assertValidation(
  validationResult: ValidationResult, 
  context?: Record<string, any>
): void {
  if (!validationResult.isValid) {
    // 使用新的 ValidationError 类
    throw new ValidationError(
      validationResult,
      'VALIDATION_FAILED',
      getValidationFormattedMessage(validationResult.errors),
      context
    );
  }
}