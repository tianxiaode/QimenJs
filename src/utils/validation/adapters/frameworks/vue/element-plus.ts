// src/utils/validation/adapters/frameworks/vue/element-plus.ts
import { convertExternalRules } from '../../rule-adapter';
import { getValidationFormattedMessage } from '../../../core';

export function createElementPlusValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);

  return function(rule: any, value: any, callback: Function) {
    const result = validator(value);
    if (result.isValid) {
      callback();
    } else {
      const errorMessage = getValidationFormattedMessage(result.errors, message);
      callback(new Error(errorMessage));
    }
  };
}

export function createElementPlusPromiseValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);

  return function(rule: any, value: any) {
    const result = validator(value);
    if (result.isValid) {
      return Promise.resolve();
    } else {
      const errorMessage = getValidationFormattedMessage(result.errors, message);
      return Promise.reject(new Error(errorMessage));
    }
  };
}