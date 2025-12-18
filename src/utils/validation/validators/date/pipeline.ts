// validators/date/pipeline.ts
import { ValidationError } from '../../core/types'
import { DateRule } from '../../rules'

import { validateDateRequired } from './required'
import { validateDateType } from './type'
import { validateDateRange } from './range'

export function validateDate(
  value: any,
  rule: DateRule,
  path?: string
): ValidationError[] {

  const errors: ValidationError[] = []

  const validators = [
    validateDateRequired,
    validateDateType,
    validateDateRange,
  ]

  for (const validator of validators) {
    const error = validator(value, rule, path)
    if (error) {
      errors.push(error)
      break
    }
  }

  return errors
}
