// validators/array/type.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { ArrayRule } from '../../rules'

export function validateArrayType(
  value: any,
  _rule: ArrayRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (!Array.isArray(value)) {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'array', actual: typeof value },
      path,
    })
  }

  return null
}
