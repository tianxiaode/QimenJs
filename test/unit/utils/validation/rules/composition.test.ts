// src/utils/validation/rules/__tests__/composition.test.ts
import { allRules, anyRules, notRule, conditionalRule, ValidationRuleResult } from '@orbitjs/utils';

// Mock 验证规则用于测试
const alwaysValidRule = <T>(value: T): ValidationRuleResult => ({
  isValid: true,
  errors: []
});

const alwaysInvalidRule = <T>(value: T): ValidationRuleResult => ({
  isValid: false,
  errors: [{
    errorCode: 'ALWAYS_INVALID',
    errorParams: { value }
  }]
});

const customInvalidRule = <T>(errorCode: string) => (value: T): ValidationRuleResult => ({
  isValid: false,
  errors: [{
    errorCode,
    errorParams: { value }
  }]
});

describe('composition validation rules', () => {
  describe('allRules', () => {
    it('should return valid when all rules are valid', () => {
      const composedRule = allRules(alwaysValidRule, alwaysValidRule);
      const result = composedRule('test');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when one rule is invalid', () => {
      const composedRule = allRules(alwaysValidRule, alwaysInvalidRule);
      const result = composedRule('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorCode).toBe('ALWAYS_INVALID');
    });

    it('should collect errors from all invalid rules', () => {
      const composedRule = allRules(
        customInvalidRule('ERROR_1'),
        customInvalidRule('ERROR_2')
      );
      const result = composedRule('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].errorCode).toBe('ERROR_1');
      expect(result.errors[1].errorCode).toBe('ERROR_2');
    });
  });

  describe('anyRules', () => {
    it('should return valid when at least one rule is valid', () => {
      const composedRule = anyRules(alwaysInvalidRule, alwaysValidRule);
      const result = composedRule('test');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when all rules are invalid', () => {
      const composedRule = anyRules(alwaysInvalidRule, alwaysInvalidRule);
      const result = composedRule('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it('should return immediately when first valid rule is found', () => {
      const rule1 = jest.fn(alwaysInvalidRule);
      const rule2 = jest.fn(alwaysValidRule);
      const rule3 = jest.fn(); // 这个不应该被调用
      
      const composedRule = anyRules(rule1, rule2, rule3);
      const result = composedRule('test');
      
      expect(result.isValid).toBe(true);
      expect(rule1).toHaveBeenCalled();
      expect(rule2).toHaveBeenCalled();
      expect(rule3).not.toHaveBeenCalled();
    });
  });

  describe('notRule', () => {
    it('should invert a valid rule to invalid', () => {
      const invertedRule = notRule(alwaysValidRule);
      const result = invertedRule('test');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].errorCode).toBe('NOT_SATISFY_CONDITION');
    });

    it('should invert an invalid rule to valid', () => {
      const invertedRule = notRule(alwaysInvalidRule);
      const result = invertedRule('test');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('conditionalRule', () => {
    it('should apply rule when condition is met', () => {
      const condition = (value: string) => value.length > 3;
      const conditional = conditionalRule(condition, alwaysInvalidRule);
      const result = conditional('test-value'); // length > 3
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should skip rule when condition is not met', () => {
      const condition = (value: string) => value.length > 10;
      const conditional = conditionalRule(condition, alwaysInvalidRule);
      const result = conditional('test'); // length < 10
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass the value to both condition and rule', () => {
      const condition = jest.fn((value: string) => value === 'expected');
      const rule = jest.fn(alwaysValidRule);
      const conditional = conditionalRule(condition, rule);
      
      conditional('expected');
      
      expect(condition).toHaveBeenCalledWith('expected');
      expect(rule).toHaveBeenCalledWith('expected');
    });
  });
});