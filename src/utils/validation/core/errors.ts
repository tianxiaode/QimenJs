import { ValidationErrorCode } from './error-codes'
import { ValidationError } from './types'

export function createError(
  code: ValidationErrorCode,
  options?: {
    params?: Record<string, any>
    path?: string | string[]
  }
): ValidationError {
  return {
    code,
    params: options?.params,
    path: options?.path,
  }
}
