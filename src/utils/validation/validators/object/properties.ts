import { ValidationRuleError } from '../../core/types'
import { ObjectRule } from '../../rules'
import { InternalValidate } from '../../core/internal'
import { ValidationErrorCode } from '../../core/error-codes'
import { createError } from '../../core/errors'

export function validateObjectProperties(
  value: any,
  rule: ObjectRule,
  validate: InternalValidate,
  path?: string
): ValidationRuleError | null {

  if (typeof value !== 'object' || value === null) return null
  if (!rule.properties) return null

  const props = rule.properties

  // 1️⃣ 必填字段检查
  if (rule.requiredFields) {
    for (const key of rule.requiredFields) {
      if (!(key in value)) {
        const fieldPath = path ? `${path}.${key}` : key
        return createError(ValidationErrorCode.MISSING_FIELD, {
          params: { field: key },
          path: fieldPath,
        })
      }
    }
  }

  // 2️⃣ 已定义字段递归校验
  for (const key of Object.keys(props)) {
    const fieldRule = props[key]
    const fieldValue = value[key]
    const fieldPath = path ? `${path}.${key}` : key

    const result = validate(fieldValue, fieldRule, fieldPath)

    if (!result.valid && result.errors?.length) {
      return result.errors[0] // short-circuit
    }
  }

  return null
}
