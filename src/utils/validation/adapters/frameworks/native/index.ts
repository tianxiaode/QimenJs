// src/utils/validation/adapters/frameworks/native/index.ts
import { convertExternalRules } from '../../rule-adapter';
import { getGlobalErrorMessageHandler } from '../../../errors';

export function createNativeValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);
  const errorHandler = getGlobalErrorMessageHandler();
  
  return function(value: any): Promise<void> {
    const result = validator(value);
    if (result.isValid) {
      return Promise.resolve();
    } else {
      // 直接使用错误处理器格式化消息
      const errorMessage = errorHandler.getFormattedMessage(result.errors, message);
      return Promise.reject(new Error(errorMessage));
    }
  };
}