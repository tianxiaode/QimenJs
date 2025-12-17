import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 布尔值验证规则的配置接口
 */
export interface BooleanValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 允许的值列表 */
  allowedValues?: boolean[];
  /** 自定义验证函数 */
  custom?: (value: boolean) => ValidationResult;
  /** 转换为布尔值的规则 */
  coerce?: boolean;
  /** 真值列表（用于转换） */
  truthyValues?: any[];
  /** 假值列表（用于转换） */
  falsyValues?: any[];
  /** 严格模式（必须是布尔类型） */
  strict?: boolean;
}
