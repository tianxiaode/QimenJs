// validators/number/enum.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { NumberRule } from '../../rules'

export function validateNumberEnum(
  value: any,
  rule: NumberRule,
  path?: string
): ValidatorResult {

  if (!rule.enum) return null
  if (value === null || value === undefined) return null

  if (!rule.enum.includes(value)) {
    return createError(ValidationErrorCode.NOT_ALLOWED, {
      params: { allowed: rule.enum, value },
      path,
    })
  }

  return null
}
