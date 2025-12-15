// rules/base.ts
/**
 * 验证规则错误信息接口
 */
export interface ValidationErrorParams {
  // 基础信息
  value?: any;
  expected?: string | string[];
  actual?: any;
  
  // 约束参数
  min?: number | string;
  max?: number | string;
  lower?: number;
  upper?: number;
  
  // 集合参数
  collection?: any[];
  collectionText?: string;
  duplicate?: any;
  missingKey?: string;
  disallowedKey?: string;
  forbiddenKey?: string;
  allowedKeys?: string[];
  disallowedKeys?: string[];
  
  // 模式参数
  pattern?: string;
  patternText?: string;
  missing?: string[];
  missingRequirements?: string;
  
  // 结构参数
  index?: number;
  key?: string;
  keyValue?: any;
  minLength?: number;
  maxLength?: number;
  minKeys?: number;
  maxKeys?: number;
  minSize?: number;
  maxSize?: number;
  actualLength?: number;
  actualKeys?: number;
  actualSize?: number;
  
  // 日期参数
  date?: Date | string;
  minDate?: Date | string;
  maxDate?: Date | string;
  
  // 上下文参数
  paramName?: string;
  functionName?: string;
  validatorIndex?: number;
  
  // 扩展参数
  [key: string]: any;
}


export interface ValidationError {
  /**
   * 错误代码
   */
  errorCode: string;
  
  /**
   * 错误参数
   */
  errorParams?: ValidationErrorParams;
  
  /**
   * 可选的详细错误信息
   */
  errorMessage?: string;
}

/**
 * 验证规则结果接口
 */
export interface ValidationResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  
  /**
   * 错误列表（可以为空）
   */
  errors: ValidationError[];
}

/**
 * 单一验证规则函数类型
 */
export type ValidationSingleRule<T = any> = (value: T, options?: any) => ValidationResult;

/**
 * 复合验证规则函数类型
 */
export type ValidationCompositeRule<T = any> = (value: T, options?: any) => ValidationResult;

export interface StringValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => ValidationResult;
  trim?: boolean;  // 是否自动去除首尾空格
  allowEmpty?: boolean;  // 是否允许空字符串（与required配合使用）
  whitelist?: string[];  // 白名单
  blacklist?: string[];  // 黑名单
}

export interface NumberValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  negative?: boolean;
  custom?: (value: number) => ValidationResult;
}

export interface DateValidationRules {
  required?: boolean;
  min?: Date;
  max?: Date;
  future?: boolean;
  past?: boolean;
  custom?: (value: Date) => ValidationResult;
}

export interface DelimitedStringValidationRules {
  required?: boolean;
  delimiter?: string;           // 分隔符，默认为逗号
  trimItems?: boolean;         // 是否修剪项，默认为true
  allowEmptyItems?: boolean;   // 是否允许空项，默认为false
  minItems?: number;           // 最少项数
  maxItems?: number;           // 最多项数
  itemMinLength?: number;      // 单个项的最小长度
  itemMaxLength?: number;      // 单个项的最大长度
  itemPattern?: RegExp;        // 单个项的正则模式
  validateItem?: (item: string) => ValidationResult; // 自定义单项验证
}

export interface ArrayValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  items?: (item: any) => ValidationResult;  // 数组项验证器
  custom?: (value: any[]) => ValidationResult;
}

export interface ErrorMessageHandler {
  /**
   * 根据错误信息生成本地化消息
   * @param error 验证错误信息
   * @returns 本地化的错误消息字符串
   */
  getMessage(error: ValidationError): string;
  
  /**
   * 批量处理错误消息
   * @param errors 验证错误信息数组
   * @param customMessage 自定义错误消息
   * @returns 格式化后的完整错误消息
   */
  getFormattedMessage(errors: ValidationError[], customMessage?: string): string;
}

