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
    [K in keyof T]?: (value: T[K]) => ValidationResult;
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
  custom?: (value: T) => ValidationResult;
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
