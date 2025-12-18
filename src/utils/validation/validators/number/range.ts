// validators/number/range.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { NumberRule } from '../../rules'

export function validateNumberRange(
  value: any,
  rule: NumberRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (rule.min !== undefined && value < rule.min) {
    return createError(ValidationErrorCode.TOO_SMALL, {
      params: { min: rule.min, value },
      path,
    })
  }

  if (rule.exclusiveMin !== undefined && value <= rule.exclusiveMin) {
    return createError(ValidationErrorCode.TOO_SMALL, {
      params: { min: rule.exclusiveMin, exclusive: true, value },
      path,
    })
  }

  if (rule.max !== undefined && value > rule.max) {
    return createError(ValidationErrorCode.TOO_LARGE, {
      params: { max: rule.max, value },
      path,
    })
  }

  if (rule.exclusiveMax !== undefined && value >= rule.exclusiveMax) {
    return createError(ValidationErrorCode.TOO_LARGE, {
      params: { max: rule.exclusiveMax, exclusive: true, value },
      path,
    })
  }

  return null
}
