// validators/boolean/pipeline.ts
import { ValidationRuleError } from '../../core/types'
import { BooleanRule } from '../../rules'

import { validateBooleanRequired } from './required'
import { validateBooleanType } from './type'
import { validateBooleanEnum } from './enum'

export function validateBoolean(
  value: any,
  rule: BooleanRule,
  path?: string
): ValidationRuleError[] {

  const errors: ValidationRuleError[] = []

  const validators = [
    validateBooleanRequired,
    validateBooleanType,
    validateBooleanEnum,
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
