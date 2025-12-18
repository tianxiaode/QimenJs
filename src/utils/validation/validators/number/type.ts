// validators/number/type.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { NumberRule } from '../../rules'

export function validateNumberType(
  value: any,
  _rule: NumberRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (typeof value !== 'number') {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'number', actual: typeof value },
      path,
    })
  }

  if (!Number.isFinite(value)) {
    return createError(ValidationErrorCode.INVALID_VALUE, {
      params: { value },
      path,
    })
  }

  return null
}
