import { ValidationErrorCode } from './error-codes'
import { ValidationRuleError } from './types'

export function createError(
  code: ValidationErrorCode,
  options?: {
    params?: Record<string, any>
    path?: string | string[]
  }
): ValidationRuleError {
  return {
    code,
    params: options?.params,
    path: options?.path,
  }
}
