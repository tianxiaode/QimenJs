// rules/base.ts
/**
 * 验证规则错误信息接口
 */
export interface ValidationRuleError {
  /**
   * 错误代码
   */
  errorCode: string;
  
  /**
   * 错误参数
   */
  errorParams?: Record<string, any>;
  
  /**
   * 可选的详细错误信息
   */
  errorMessage?: string;
}

/**
 * 验证规则结果接口
 */
export interface ValidationRuleResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  
  /**
   * 错误列表（可以为空）
   */
  errors: ValidationRuleError[];
}

/**
 * 单一验证规则函数类型
 */
export type ValidationSingleRule<T = any> = (value: T, options?: any) => ValidationRuleResult;

/**
 * 复合验证规则函数类型
 */
export type ValidationCompositeRule<T = any> = (value: T, options?: any) => ValidationRuleResult;