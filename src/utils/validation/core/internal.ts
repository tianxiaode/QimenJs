import { ValidationResult } from './types'

export type InternalValidate = (
  value: any,
  rule: any,
  path?: string
) => ValidationResult
