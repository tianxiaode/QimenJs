// composables/useValidator.ts
import { buildStringValidator } from '@/utils/validation/builders/string-validator';
import type { StringValidationRules } from '@/utils/validation/base';

interface ValidatorOptions {
  message?: string;
  framework?: 'element' | 'antd' | 'native';
}

export function useValidator(
  rules: StringValidationRules, 
  options: ValidatorOptions = {}
) {
  const { message, framework = 'element' } = options;
  const validator = buildStringValidator(rules);
  
  switch (framework) {
    case 'element':
      return function(rule: any, value: any, callback: Function) {
        const result = validator(value);
        if (result.isValid) {
          callback();
        } else {
          callback(new Error(message || '验证失败'));
        }
      };
      
    case 'antd':
      return function(rule: any, value: any, callback: Function) {
        const result = validator(value);
        if (result.isValid) {
          callback();
        } else {
          callback(message || '验证失败');
        }
      };
      
    case 'native':
    default:
      return function(value: any): Promise<void> {
        const result = validator(value);
        if (result.isValid) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error(message || '验证失败'));
        }
      };
  }
}