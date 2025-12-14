// rules/base/results.ts
import { ValidationResult } from './types';
import { ValidationErrorCode } from '../constants';

export function createValidationSuccess(): ValidationResult {
  return { isValid: true, errors: [] };
}

export function createValidationFailure(
  errorCode: ValidationErrorCode,
  errorParams?: Record<string, any>
): ValidationResult {
  return {
    isValid: false,
    errors: [{ errorCode, errorParams }]
  };
}

export function mergeValidationResults(
  ...results: ValidationResult[]
): ValidationResult {
  const allErrors = results
    .filter(result => !result.isValid)
    .flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}