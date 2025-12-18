// validators/object/type.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { ObjectRule } from '../../rules'

export function validateObjectType(
  value: any,
  _rule: ObjectRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (typeof value !== 'object' || Array.isArray(value)) {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'object', actual: typeof value },
      path,
    })
  }

  return null
}
