// validators/array/length.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { ArrayRule } from '../../rules'

export function validateArrayLength(
  value: any,
  rule: ArrayRule,
  path?: string
): ValidatorResult {

  if (!Array.isArray(value)) return null

  const length = value.length

  if (rule.exactLength !== undefined && length !== rule.exactLength) {
    return createError(ValidationErrorCode.INVALID_VALUE, {
      params: { expected: rule.exactLength, actual: length },
      path,
    })
  }

  if (rule.minLength !== undefined && length < rule.minLength) {
    return createError(ValidationErrorCode.TOO_SMALL, {
      params: { min: rule.minLength, actual: length },
      path,
    })
  }

  if (rule.maxLength !== undefined && length > rule.maxLength) {
    return createError(ValidationErrorCode.TOO_LARGE, {
      params: { max: rule.maxLength, actual: length },
      path,
    })
  }

  if (rule.allowEmpty === false && length === 0) {
    return createError(ValidationErrorCode.INVALID_VALUE, {
      params: { reason: 'empty_array' },
      path,
    })
  }

  return null
}
