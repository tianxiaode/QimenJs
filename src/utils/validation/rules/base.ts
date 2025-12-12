// rules/base.ts
export interface RuleError {
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

export interface RuleResult {
  /**
   * 验证是否通过
   */
  isValid: boolean;
  
  /**
   * 错误列表（可以为空）
   */
  errors: RuleError[];
}