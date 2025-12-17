// src/utils/validation/adapters/frameworks/vue/vant.ts
import { convertExternalRules } from '../../rule-adapter';
import { getValidationFormattedMessage } from '../../../core';

/**
 * 创建 Vant 兼容的验证器
 * @param rules 外部规则定义
 * @param message 自定义错误消息
 * @returns Vant 格式的验证函数
 */
export function createVantValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);

  return function(rule: any, value: any, callback: Function) {
    const result = validator(value);
    if (result.isValid) {
      callback();
    } else {
      // 使用统一的错误信息格式化方法
      const errorMessage = getValidationFormattedMessage(result.errors, message);
      callback(new Error(errorMessage));
    }
  };
}

/**
 * 创建 Vant Promise 格式的验证器
 * @param rules 外部规则定义
 * @param message 自定义错误消息
 * @returns 返回 Promise 的验证函数
 */
export function createVantPromiseValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);
  
  return function(rule: any, value: any) {
    const result = validator(value);
    if (result.isValid) {
      return Promise.resolve();
    } else {
      // 使用统一的错误信息格式化方法
      const errorMessage = getValidationFormattedMessage(result.errors, message);
      return Promise.reject(new Error(errorMessage));
    }
  };
}