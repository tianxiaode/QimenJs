// validators/boolean/enum.ts
import { ValidationError } from '../../core/types'
import { BooleanRule } from '../../rules'
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'

export function validateBooleanEnum(
  value: any,
  rule: BooleanRule,
  path?: string
): ValidationError | null {

  if (typeof value !== 'boolean') return null
  if (!rule.enum) return null

  if (!rule.enum.includes(value)) {
    return createError(ValidationErrorCode.NOT_ALLOWED, {
      params: { allowed: rule.enum },
      path,
    })
  }

  return null
}
