// tests/validation/rules/utils.test.ts
import { 
  createValidationFailure, 
  createValidationSuccess, 
  createTypeValidationFailure, 
  mergeValidationResults,
  ValidationErrorCode,
  ValidationRuleResult 
} from '@orbitjs/utils';

describe('Validation Rules Utils', () => {
  describe('createValidationFailure', () => {
    it('should create a validation failure result with error code', () => {
      const result = createValidationFailure(ValidationErrorCode.TYPE_NOT_STRING);
      
      expect(result).toEqual({
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING,
          errorParams: undefined
        }]
      });
    });

    it('should create a validation failure result with error code and parameters', () => {
      const errorParams = { min: 5, max: 10 };
      const result = createValidationFailure(ValidationErrorCode.MIN_LENGTH, errorParams);
      
      expect(result).toEqual({
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.MIN_LENGTH,
          errorParams
        }]
      });
    });
  });

  describe('createValidationSuccess', () => {
    it('should create a validation success result', () => {
      const result = createValidationSuccess();
      
      expect(result).toEqual({
        isValid: true,
        errors: []
      });
    });
  });

  describe('createTypeValidationFailure', () => {
    it('should create a type validation failure result', () => {
      const result = createTypeValidationFailure('string', 123);
      
      expect(result).toEqual({
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING,
          errorParams: {
            value: 123,
            expected: 'string'
          }
        }]
      });
    });

    it('should handle different actual values', () => {
      const testCases = [
        { expected: 'string', actual: null },
        { expected: 'number', actual: 'text' },
        { expected: 'boolean', actual: {} }
      ];

      testCases.forEach(({ expected, actual }) => {
        const result = createTypeValidationFailure(expected, actual);
        
        expect(result.isValid).toBe(false);
        expect(result.errors[0].errorCode).toBe(ValidationErrorCode.TYPE_NOT_STRING);
        expect(result.errors[0].errorParams).toEqual({
          value: actual,
          expected
        });
      });
    });
  });

  describe('mergeValidationResults', () => {
    it('should merge multiple successful validation results', () => {
      const result1: ValidationRuleResult = { isValid: true, errors: [] };
      const result2: ValidationRuleResult = { isValid: true, errors: [] };
      
      const merged = mergeValidationResults(result1, result2);
      
      expect(merged).toEqual({
        isValid: true,
        errors: []
      });
    });

    it('should merge successful and failed validation results', () => {
      const successResult: ValidationRuleResult = { isValid: true, errors: [] };
      const failureResult: ValidationRuleResult = {
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING
        }]
      };
      
      const merged = mergeValidationResults(successResult, failureResult);
      
      expect(merged).toEqual({
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING
        }]
      });
    });

    it('should merge multiple failed validation results', () => {
      const failureResult1: ValidationRuleResult = {
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING
        }]
      };
      
      const failureResult2: ValidationRuleResult = {
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
          errorParams: { pattern: 'email' }
        }]
      };
      
      const merged = mergeValidationResults(failureResult1, failureResult2);
      
      expect(merged).toEqual({
        isValid: false,
        errors: [
          {
            errorCode: ValidationErrorCode.TYPE_NOT_STRING
          },
          {
            errorCode: ValidationErrorCode.TYPE_NOT_NUMBER,
            errorParams: { pattern: 'email' }
          }
        ]
      });
    });

    it('should handle empty array of results', () => {
      const merged = mergeValidationResults();
      
      expect(merged).toEqual({
        isValid: true,
        errors: []
      });
    });

    it('should handle single validation result', () => {
      const failureResult: ValidationRuleResult = {
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING
        }]
      };
      
      const merged = mergeValidationResults(failureResult);
      
      expect(merged).toEqual({
        isValid: false,
        errors: [{
          errorCode: ValidationErrorCode.TYPE_NOT_STRING
        }]
      });
    });
  });
});