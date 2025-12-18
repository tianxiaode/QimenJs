// validators/boolean/type.ts
import { ValidatorResult } from '../../core/types'
import { BooleanRule } from '../../rules'
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'

export function validateBooleanType(
  value: any,
  _rule: BooleanRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (typeof value !== 'boolean') {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'boolean', actual: typeof value },
      path,
    })
  }

  return null
}
