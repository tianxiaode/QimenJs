// validators/boolean/required.ts
import { ValidatorResult } from '../../core/types'
import { BooleanRule } from '../../rules'
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'

export function validateBooleanRequired(
  value: any,
  rule: BooleanRule,
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
