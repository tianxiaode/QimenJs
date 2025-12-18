import { createError, ValidationErrorCode, ValidatorResult } from "../../core"
import { StringRule } from "../../rules"

export function validateStringPattern(
  value: string,
  rule: StringRule,
  path?: string
): ValidatorResult {
  if (!rule.pattern) return null

  if (!rule.pattern.test(value)) {
    return createError(ValidationErrorCode.PATTERN_MISMATCH, {
      params: { pattern: rule.pattern.source },
      path,
    })
  }

  return null
}
