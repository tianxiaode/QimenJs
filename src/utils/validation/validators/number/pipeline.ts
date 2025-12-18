// validators/number/pipeline.ts
import { ValidationError } from '../../core/types'
import { NumberRule } from '../../rules'

import { validateNumberRequired } from './required'
import { validateNumberType } from './type'
import { validateNumberInteger } from './integer'
import { validateNumberRange } from './range'
import { validateNumberEnum } from './enum'

export function validateNumber(
  value: any,
  rule: NumberRule,
  path?: string
): ValidationError[] {

  const validators = [
    validateNumberRequired,
    validateNumberType,
    validateNumberInteger,
    validateNumberRange,
    validateNumberEnum,
  ]

  const errors: ValidationError[] = []

  for (const validator of validators) {
    const error = validator(value, rule, path)
    if (error) {
      errors.push(error)
      break // short-circuit
    }
  }

  return errors
}
