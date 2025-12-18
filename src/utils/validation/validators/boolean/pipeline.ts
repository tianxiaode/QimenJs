// validators/boolean/pipeline.ts
import { ValidationError } from '../../core/types'
import { BooleanRule } from '../../rules'

import { validateBooleanRequired } from './required'
import { validateBooleanType } from './type'
import { validateBooleanEnum } from './enum'

export function validateBoolean(
  value: any,
  rule: BooleanRule,
  path?: string
): ValidationError[] {

  const errors: ValidationError[] = []

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
