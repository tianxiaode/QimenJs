import { ValidationErrorContext, ValidationResult } from './types'

export type InternalValidate = (
  value: any,
  rule: any,
  context?: ValidationErrorContext
) => ValidationResult
