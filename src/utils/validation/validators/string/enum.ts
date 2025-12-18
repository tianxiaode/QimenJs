// validators/string/enum.ts
import { createError } from '../../core'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { StringRule } from '../../rules'

export function validateStringEnum(
  value: string,
  rule: StringRule,
  path?: string
): ValidatorResult {

  if (!rule.enum) return null

  if (!rule.enum.includes(value)) {
    return createError(ValidationErrorCode.NOT_ALLOWED, {
      params: { allowed: rule.enum },
      path,
    })
  }

  return null
}
