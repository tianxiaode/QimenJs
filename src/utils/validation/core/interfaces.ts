import { ValidationResult } from "./types";
/**
 * 字符串验证规则接口
 */
export interface StringValidationRules {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => ValidationResult;
    trim?: boolean; // 是否自动去除首尾空格
    allowEmpty?: boolean; // 是否允许空字符串（与required配合使用）
    whitelist?: string[]; // 白名单
    blacklist?: string[]; // 黑名单
}

/**
 * 数值验证规则接口
 */
export interface NumberValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    custom?: (value: number) => ValidationResult;
}

/**
 * 布尔验证规则接口
 */
export interface DateValidationRules {
    required?: boolean;
    min?: Date;
    max?: Date;
    future?: boolean;
    past?: boolean;
    custom?: (value: Date) => ValidationResult;
}

/**
 * 带分隔符字符串验证规则
 */
export interface DelimitedStringValidationRules {
    required?: boolean;
    delimiter?: string; // 分隔符，默认为逗号
    trimItems?: boolean; // 是否修剪项，默认为true
    allowEmptyItems?: boolean; // 是否允许空项，默认为false
    minItems?: number; // 最少项数
    maxItems?: number; // 最多项数
    itemMinLength?: number; // 单个项的最小长度
    itemMaxLength?: number; // 单个项的最大长度
    itemPattern?: RegExp; // 单个项的正则模式
    validateItem?: (item: string) => ValidationResult; // 自定义单项验证
}


/**
 * 数组验证规则接口
 * 
 * 注意：
 * - 数组元素的验证规则是通过 `items` 属性来实现的，而不是直接在数组规则中定义。
 * - 数组元素的验证规则可以是一个函数，也可以是一个对象。
 * - 如果数组元素的验证规则是一个函数，则该函数接收数组元素作为参数，返回一个验证结果。
 * - 如果数组元素的验证规则是一个对象，则该对象可以包含多个验证规则。
 * - 数组元素的验证规则可以是复合规则，也可以是单一规则。
 */
export interface ArrayValidationRules {
  /**
   * 存在性控制：
   * - undefined/null: 允许不存在（默认）
   * - false: 允许不存在
   * - true: 必须存在，但可以为空数组 []
   * - 'non-empty': 必须存在且不能为空数组
   */    
  required?: boolean | 'non-empty';
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  unique?: boolean;
  uniqueBy?: (item: any) => any;
  
  /**
   * 验证数组的每个元素
   * @example
   * // 验证每个元素是字符串
   * items: (item) => validateString(item, { minLength: 2 })
   * 
   * // 验证每个元素是特定结构的对象
   * items: (item) => validateObject(item, {
   *   name: { type: 'string', required: true },
   *   age: { type: 'number', min: 0 }
   * })
   */
  items?: (item: any) => ValidationResult;
  
  /**
   * 至少一个元素满足条件
   */
  some?: (item: any) => ValidationResult;
  
  includes?: any;
  excludes?: any;
  sorted?: boolean;
  sortedBy?: (a: any, b: any) => number;
  matches?: (value: any[]) => boolean;
  custom?: (value: any[]) => ValidationResult;
}


/**
 * 布尔验证规则接口
 */
export interface BooleanValidationRules {
    required?: boolean;
    custom?: (value: boolean) => ValidationResult;
}

/**
 * 对象验证规则接口
 */
export interface ObjectValidationRules {
    required?: boolean;
    minKeys?: number;
    maxKeys?: number;
    allowedKeys?: string[];
    disallowedKeys?: string[];
    custom?: (value: object) => ValidationResult;
}
