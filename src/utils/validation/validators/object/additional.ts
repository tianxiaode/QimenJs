// validators/object/additional.ts
import { ValidationError } from '../../core/types'
import { ObjectRule } from '../../rules'
import { ValidationErrorCode } from '../../core/error-codes'
import { createError } from '../../core/errors'

export function validateObjectAdditionalProperties(
  value: any,
  rule: ObjectRule,
  path?: string
): ValidationError | null {

  if (typeof value !== 'object' || value === null) return null
  if (rule.additionalProperties !== false) return null
  if (!rule.properties) return null

  const allowedKeys = new Set(Object.keys(rule.properties))

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      const fieldPath = path ? `${path}.${key}` : key
      return createError(ValidationErrorCode.NOT_ALLOWED, {
        params: { field: key },
        path: fieldPath,
      })
    }
  }

  return null
}
