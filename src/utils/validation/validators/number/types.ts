import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 数字验证规则的配置接口
 */
export interface NumberValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 精确值 */
  exact?: number;
  /** 是否为整数 */
  integer?: boolean;
  /** 是否为正数 */
  positive?: boolean;
  /** 是否为负数 */
  negative?: boolean;
  /** 是否为零 */
  zero?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 允许 NaN 值 */
  allowNaN?: boolean;
  /** 允许无限值 */
  allowInfinite?: boolean;
  /** 自定义验证函数 */
  custom?: (value: number) => ValidationResult | Promise<ValidationResult>;
  /** 数值范围（包含边界） */
  range?: [min: number, max: number];
  /** 数值范围（不包含边界） */
  exclusiveRange?: [min: number, max: number];
  /** 允许的值列表 */
  allowedValues?: number[];
  /** 禁止的值列表 */
  disallowedValues?: number[];
}

/**
 * 数字验证器的函数类型
 */
export type NumberValidator = {
  (value: any): ValidationResult;
  (value: any): Promise<ValidationResult>;
  options: NumberValidationOptions;
};

/**
 * 数字验证规则构造器
 */
export interface NumberValidationRules {
  /** 创建一个数字验证器 */
  create(options?: NumberValidationOptions): NumberValidator;
  
  /** 预设验证器 */
  presets: {
    /** 正整数验证器 */
    positiveInteger: NumberValidator;
    /** 非负整数验证器 */
    nonNegativeInteger: NumberValidator;
    /** 有限数字验证器（排除 NaN 和 Infinity） */
    finiteNumber: NumberValidator;
    /** 百分比验证器（0-100） */
    percentage: NumberValidator;
    /** 金额验证器（两位小数） */
    money: NumberValidator;
    /** 坐标验证器（经度/纬度） */
    coordinate: NumberValidator;
    /** 年龄验证器（0-150） */
    age: NumberValidator;
    /** 评分验证器（0-5） */
    rating: NumberValidator;
    /** 年份验证器 */
    year: NumberValidator;
  };
}

/**
 * 数字验证上下文
 */
export interface NumberValidationContext {
  /** 原始值 */
  originalValue: any;
  /** 数字值 */
  value: number | null;
  /** 验证选项 */
  options: NumberValidationOptions;
  /** 验证结果 */
  result: ValidationResult;
}