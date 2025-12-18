// validators/array/required.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { ArrayRule } from '../../rules'

export function validateArrayRequired(
  value: any,
  rule: ArrayRule,
  path?: string
): ValidatorResult {

  if (!rule.required) return null

  if (value === undefined) {
    return createError(ValidationErrorCode.REQUIRED, { path })
  }

  if (value === null && rule.nullable !== true) {
    return createError(ValidationErrorCode.REQUIRED, { path })
  }

  return null
}
