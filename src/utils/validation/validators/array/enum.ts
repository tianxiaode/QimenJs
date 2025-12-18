// validators/array/enum.ts
import { createError } from '../../core/errors'
import { ValidationErrorCode } from '../../core/error-codes'
import { ValidatorResult } from '../../core/types'
import { ArrayRule } from '../../rules'

function isSameArray(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

export function validateArrayEnum(
  value: any,
  rule: ArrayRule,
  path?: string
): ValidatorResult {

  if (!Array.isArray(value)) return null
  if (!rule.enum) return null

  const allowed = rule.enum.some(item => isSameArray(item, value))

  if (!allowed) {
    return createError(ValidationErrorCode.NOT_ALLOWED, {
      params: { allowed: rule.enum, value },
      path,
    })
  }

  return null
}
