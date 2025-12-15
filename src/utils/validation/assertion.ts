// validation/assertion.ts 或 validation/assert.ts
import { ValidationResult } from './base';
import { ValidationError, getValidationFormattedMessage } from './errors'

export function assert(
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