// validators/string/pipeline.ts
import { ValidationError, ValidatorResult } from '../../core'
import { StringRule } from '../../rules'

import { validateStringRequired } from './required'
import { validateStringType } from './type'
import { validateStringLength } from './length'
import { validateStringPattern } from './pattern'
import { validateStringEnum } from './enum'

export function validateString(
  value: any,
  rule: StringRule,
  path?: string
): ValidationError[] {

  const validators = [
    validateStringRequired,
    validateStringType,
    validateStringLength,
    validateStringPattern,
    validateStringEnum,
  ]

  const errors: ValidationError[] = []

  for (const validator of validators) {
    const error = validator(value, rule, path)
    if (error) {
      errors.push(error)
      break // ⭐ 第一版：直接 short-circuit
    }
  }

  return errors
}
