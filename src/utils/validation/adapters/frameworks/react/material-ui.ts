// src/utils/validation/adapters/frameworks/react/material-ui.ts
import { convertExternalRules } from '../../rule-adapter';
import { getValidationFormattedMessage } from '../../../core';

/**
 * 创建 Material-UI 兼容的验证器
 * @param rules 外部规则定义
 * @param message 自定义错误消息
 * @returns Material-UI 格式的验证函数
 */
export function createMaterialUIValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);

  return function(value: any) {
    const result = validator(value);
    if (result.isValid) {
      return null;
    } else {
      // 使用统一的错误信息格式化方法
      const errorMessage = getValidationFormattedMessage(result.errors, message);
      return errorMessage;
    }
  };
}

/**
 * 创建 Material-UI Promise 格式的验证器
 * @param rules 外部规则定义
 * @param message 自定义错误消息
 * @returns 返回 Promise 的验证函数
 */
export function createMaterialUIPromiseValidator(rules: any, message?: string) {
  const validator = convertExternalRules(rules);
  return function(value: any) {
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