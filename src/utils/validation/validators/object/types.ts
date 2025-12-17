import { ValidationErrorCode,ValidationResult } from '../../core';

/**
 * 对象验证规则的配置接口
 */
export interface ObjectValidationOptions<T = Record<string, any>> {
  /** 是否为必填字段 */
  required?: boolean;
  /** 允许为空值（null/undefined） */
  nullable?: boolean;
  /** 是否允许空对象 */
  allowEmpty?: boolean;
  /** 自定义错误消息 */
  message?: string | ((errorCode: ValidationErrorCode, value: any) => string);
  /** 属性验证规则 */
  properties?: {
    [K in keyof T]?: (value: T[K]) => ValidationResult | Promise<ValidationResult>;
  };
  /** 必须包含的属性 */
  requiredProperties?: Array<keyof T | string>;
  /** 不能包含的属性 */
  forbiddenProperties?: Array<keyof T | string>;
  /** 属性白名单 */
  allowedProperties?: Array<keyof T | string>;
  /** 属性黑名单 */
  disallowedProperties?: Array<keyof T | string>;
  /** 自定义验证函数 */
  custom?: (value: T) => ValidationResult | Promise<ValidationResult>;
  /** 对象结构验证 */
  shape?: Partial<Record<keyof T, any>>;
  /** 严格模式（不允许额外属性） */
  strict?: boolean;
  /** 类型验证 */
  instanceOf?: Function;
  /** 属性值类型映射 */
  propertyTypes?: Partial<Record<keyof T, string | Function>>;
  /** 属性依赖关系 */
  dependencies?: Array<{
    if: keyof T | string;
    then: Array<keyof T | string>;
  }>;
}

/**
 * 对象验证器的函数类型
 */
export type ObjectValidator<T = Record<string, any>> = {
  (value: any): ValidationResult;
  (value: any): Promise<ValidationResult>;
  options: ObjectValidationOptions<T>;
};

/**
 * 对象验证规则构造器
 */
export interface ObjectValidationRules {
  /** 创建一个对象验证器 */
  create<T = Record<string, any>>(options?: ObjectValidationOptions<T>): ObjectValidator<T>;
  
  /** 预设验证器 */
  presets: {
    /** 非空对象验证器 */
    nonEmpty: ObjectValidator;
    /** 简单对象验证器（无额外属性） */
    plainObject: ObjectValidator;
    /** 表单数据验证器 */
    formData: ObjectValidator;
    /** 键值对验证器 */
    keyValuePairs: ObjectValidator<Record<string, any>>;
  };
}

/**
 * 对象验证上下文
 */
export interface ObjectValidationContext<T = Record<string, any>> {
  /** 原始值 */
  originalValue: any;
  /** 对象值 */
  value: T | null;
  /** 验证选项 */
  options: ObjectValidationOptions<T>;
  /** 验证结果 */
  result: ValidationResult;
  /** 属性验证结果 */
  propertyResults: Array<{
    key: string;
    value: any;
    result: ValidationResult;
  }>;
}