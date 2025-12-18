import { ValidationRuleError } from '../../core'
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
): ValidationRuleError[] | null {  // 修改这里，返回null而不是空数组

  const validators = [
    validateStringRequired,
    validateStringType,
    validateStringLength,
    validateStringPattern,
    validateStringEnum,
  ]

  const errors: ValidationRuleError[] = []

  for (const validator of validators) {
    const error = validator(value, rule, path)
    if (error) {
      errors.push(error)
    }
  }

  // 如果验证没有错误，返回null，否则返回错误列表
  return errors.length > 0 ? errors : null
}
