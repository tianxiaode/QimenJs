// validators/number/integer.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { NumberRule } from '../../rules'

export function validateNumberInteger(
  value: any,
  rule: NumberRule,
  path?: string
): ValidatorResult {

  if (!rule.integer) return null
  if (value === null || value === undefined) return null

  if (!Number.isInteger(value)) {
    return createError(ValidationErrorCode.INVALID_VALUE, {
      params: { value },
      path,
    })
  }

  return null
}
