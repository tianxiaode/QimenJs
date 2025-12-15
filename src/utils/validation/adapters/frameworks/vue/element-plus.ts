// src/utils/validation/adapters/frameworks/vue/element-plus.ts
import { convertExternalRules } from '../../rule-adapter';
import { getGlobalErrorMessageHandler } from '../../../errors';

export function createElementPlusValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);
  const errorHandler = getGlobalErrorMessageHandler();

  return function(rule: any, value: any, callback: Function) {
    const result = validator(value);
    if (result.isValid) {
      callback();
    } else {
      const errorMessage = errorHandler.getFormattedMessage(result.errors, message);
      callback(new Error(errorMessage));
    }
  };
}

export function createElementPlusPromiseValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);
  const errorHandler = getGlobalErrorMessageHandler();

  return function(rule: any, value: any) {
    const result = validator(value);
    if (result.isValid) {
      return Promise.resolve();
    } else {
      const errorMessage = errorHandler.getFormattedMessage(result.errors, message);
      return Promise.reject(new Error(errorMessage));
    }
  };
}