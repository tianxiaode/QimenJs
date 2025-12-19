import { ValidationErrorBuilder, ValidationErrorContext, ValidatorResult } from '../../core'
import { BooleanRule } from '../../rules'

export function validateBooleanEnum(
  value: any,
  rule: BooleanRule,
  context?: ValidationErrorContext
): ValidatorResult {

  if (typeof value !== 'boolean') return null
  if (!rule.enum) return null

  if (!rule.enum.includes(value)) {
    return ValidationErrorBuilder.not_allowed(value, rule.enum as boolean[], context)
  }

  return null
}
