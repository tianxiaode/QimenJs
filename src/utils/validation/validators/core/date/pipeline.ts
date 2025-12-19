// validators/date/pipeline.ts
import { ValidationErrorContext, ValidationRuleError } from '../../../core'
import { DateRule } from '../../../rules'

import { validateDateRequired } from './required'
import { validateDateType } from './type'
import { validateDateRange } from './range'

export function validateDate(
  value: any,
  rule: DateRule,
  context?: ValidationErrorContext
): ValidationRuleError[] | null{

  const errors: ValidationRuleError[] = []

  const validators = [
    validateDateRequired,
    validateDateType,
    validateDateRange,
  ]

  for (const validator of validators) {
    const error = validator(value, rule, context)
    if (error) {
      errors.push(error)
      break
    }
  }

  return errors.length > 0 ? errors : null
}
