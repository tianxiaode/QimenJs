import { ValidationError, ValidationResult } from '../core'
import { validateString, validateArray, validateNumber, validateObject, validateDate, validateBoolean } from '../validators'

export function validate(
  value: any,
  rule: any,
  path?: string
): ValidationResult {

  let errors: ValidationError[] = []

  switch (rule.type) {
    case 'string':
      errors = validateString(value, rule, path)
      break
    case 'number':
      errors = validateNumber(value, rule, path)
      break
    case 'array':
      errors = validateArray(value, rule, validate, path)
      break
    case 'object':
        errors = validateObject(value, rule, validate, path)
      break
    case 'date':
      errors = validateDate(value, rule, path)
      break
    case 'boolean':
      errors = validateBoolean(value, rule, path)
      break
    default:
      errors.push({ code: 'unknown_type', params: { type: rule.type } })
  }

  return {
    valid: errors.length === 0,
    errors: errors.length ? errors : undefined,
  }
}
