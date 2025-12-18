// validators/array/pipeline.ts
import { ValidationRuleError } from '../../core/types'
import { ArrayRule } from '../../rules'
import { InternalValidate } from '../../core/internal'
import { validateArrayRequired } from './required'
import { validateArrayType } from './type'
import { validateArrayLength } from './length'
import { validateArrayEnum } from './enum'
import { validateArrayItems } from './items'

export function validateArray(
  value: any,
  rule: ArrayRule,
  validate: InternalValidate,
  path?: string
): ValidationRuleError[] {

  const errors: ValidationRuleError[] = []

  const validators = [
    validateArrayRequired,
    validateArrayType,
    validateArrayLength,
    validateArrayEnum,
    (v:any, r:ArrayRule, p:string | undefined) => validateArrayItems(v, r, validate, p),
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
