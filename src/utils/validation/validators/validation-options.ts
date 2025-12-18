import { ValidationErrorCode, ValidationResult } from '../core';

/**
 * 基础验证选项接口
 */
export interface BaseValidationOptions {
  /** 是否为必填字段 */
  required?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 自定义验证函数 */
  custom?: (value: any) => ValidationResult;
}

/**
 * 字符串验证选项
 */
export interface StringValidationOptions extends BaseValidationOptions {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  pattern?: RegExp | string;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  skipIfEmpty?: boolean;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  numeric?: boolean;
  integerString?: boolean;
  username?: boolean;
  uuid?: boolean;
  ipv4?: boolean;
  ipv6?: boolean;
  mac?: boolean;
  passwordStrength?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  };
}

/**
 * 数字验证选项
 */
export interface NumberValidationOptions extends BaseValidationOptions {
  min?: number;
  max?: number;
  exact?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  zero?: boolean;
  allowNaN?: boolean;
  allowInfinite?: boolean;
  range?: [min: number, max: number];
  exclusiveRange?: [min: number, max: number];
  allowedValues?: number[];
  disallowedValues?: number[];
  finite?: boolean;
  safeInteger?: boolean;
  prime?: boolean;
  even?: boolean;
  odd?: boolean;
}

/**
 * 数组验证选项
 */
export interface ArrayValidationOptions<T = any> extends BaseValidationOptions {
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  allowEmpty?: boolean;
  itemValidation?: (item: T, index: number) => ValidationResult;
  unique?: boolean;
  uniqueBy?: (item: T) => any;
  sorted?: 'asc' | 'desc' | boolean;
  itemType?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  itemTypeCheck?: (item: any) => boolean;
  allowedValues?: T[];
  mustContain?: T[];
  mustNotContain?: T[];
  anyOf?: T[];
}

/**
 * 布尔验证选项
 */
export interface BooleanValidationOptions extends BaseValidationOptions {
  allowedValues?: boolean[];
  coerce?: boolean;
  truthyValues?: any[];
  falsyValues?: any[];
  strict?: boolean;
}

/**
 * 对象验证选项
 */
export interface ObjectValidationOptions<T = Record<string, any>> extends BaseValidationOptions {
  allowEmpty?: boolean;
  properties?: {
    [K in keyof T]?: (value: T[K]) => ValidationResult;
  };
  requiredProperties?: Array<keyof T | string>;
  forbiddenProperties?: Array<keyof T | string>;
  allowedProperties?: Array<keyof T | string>;
  disallowedProperties?: Array<keyof T | string>;
  shape?: Partial<Record<keyof T, any>>;
  strict?: boolean;
  instanceOf?: Function;
  propertyTypes?: Partial<Record<keyof T, string | Function>>;
  dependencies?: Array<{
    if: keyof T | string;
    then: Array<keyof T | string>;
  }>;
}

/**
 * 日期验证选项
 */
export interface DateValidationOptions extends BaseValidationOptions {
  min?: Date | string | number;
  max?: Date | string | number;
  range?: [min: Date | string | number, max: Date | string | number];
  past?: boolean;
  future?: boolean;
  today?: boolean;
  allowInvalid?: boolean;
  format?: string;
  strict?: boolean;
  timezone?: 'UTC' | 'local' | string;
  precision?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
  weekday?: number | number[];
  excludedDates?: Array<Date | string | number>;
  allowedDates?: Array<Date | string | number>;
}

/**
 * 所有验证选项的联合类型
 */
export type ValidationOptions =
  | StringValidationOptions
  | NumberValidationOptions
  | ArrayValidationOptions
  | BooleanValidationOptions
  | ObjectValidationOptions
  | DateValidationOptions;