// validators/date/type.ts
import { ValidatorResult } from '../../core/types'
import { DateRule } from '../../rules'
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'

export function validateDateType(
  value: any,
  _rule: DateRule,
  path?: string
): ValidatorResult {

  if (value === null || value === undefined) return null

  if (!(value instanceof Date) || isNaN(value.getTime())) {
    return createError(ValidationErrorCode.TYPE_MISMATCH, {
      params: { expected: 'Date', actual: typeof value },
      path,
    })
  }

  return null
}
