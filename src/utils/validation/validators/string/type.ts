import { createError } from '../../core'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { StringRule } from '../../rules'

export function validateStringType(
  value: any,
  _rule: StringRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (typeof value !== 'string') {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'string', actual: typeof value },
      path,
    })
  }

  return null
}
