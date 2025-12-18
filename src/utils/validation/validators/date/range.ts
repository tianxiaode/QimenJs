// validators/date/range.ts
import { ValidationRuleError } from '../../core/types'
import { DateRule } from '../../rules'
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'

export function validateDateRange(
  value: any,
  rule: DateRule,
  path?: string
): ValidationRuleError | null {

  if (!(value instanceof Date) || isNaN(value.getTime())) return null

  const time = value.getTime()

  if (rule.min && time < rule.min.getTime()) {
    return createError(ValidationErrorCode.TOO_SMALL, {
      params: { min: rule.min },
      path,
    })
  }

  if (rule.max && time > rule.max.getTime()) {
    return createError(ValidationErrorCode.TOO_LARGE, {
      params: { max: rule.max },
      path,
    })
  }

  return null
}
