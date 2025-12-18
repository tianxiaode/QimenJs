// validators/array/items.ts
import { ValidationRuleError } from '../../core/types'
import { ArrayRule } from '../../rules'
import { InternalValidate } from '../../core/internal'

export function validateArrayItems(
  value: any,
  rule: ArrayRule,
  validate: InternalValidate,
  path?: string
): ValidationRuleError | null {

  if (!Array.isArray(value)) return null
  if (!rule.items) return null

  for (let i = 0; i < value.length; i++) {
    const itemValue = value[i]
    const itemPath = path ? `${path}[${i}]` : `[${i}]`

    const result = validate(itemValue, rule.items, itemPath)

    if (!result.valid && result.errors?.length) {
      return result.errors[0]
    }
  }

  return null
}
