/**
 * 验证错误上下文信息
 * 
 * 提供了以下常用字段作为参考，您也可以添加任意自定义字段：
 * 
 * @property {string|string[]} path - 数据路径，如 'user.email' 或 ['user', 'email']
 * @property {string} field - 字段名称
 * @property {any} value - 字段当前值
 * @property {string} label - 字段显示标签
 * @property {any} parent - 父级数据
 * @property {any} root - 根级数据
 * @property {number} index - 数组索引（如果是数组项）
 * @property {string|number} key - 对象键（如果是对象属性）
 * 
 * 除了上述字段，您可以通过任意键添加自定义上下文信息。
 */
export interface ValidationErrorContext {
  // 常用基础字段（作为参考和默认使用）
  context?: ValidationErrorContext | string[]
  field?: string
  value?: any
  label?: string
  type?: string
  parent?: any
  root?: any
  index?: number
  key?: string | number
  functionName?: string
  arguments?: any[]
  
  // 允许任意自定义字段
  [key: string]: any
}

/**
 * 验证错误信息接口
 * 用于描述单个验证错误的结构
 */
export interface ValidationRuleError {
  /**
   * 错误代码，用于标识错误类型
   * 例如: 'required', 'minLength', 'patternMismatch' 等
   */
  code: string
  
  /**
   * 错误参数，可选字段，用于提供错误详情
   * 例如: { min: 5, max: 10 } 用于描述数值范围限制
   */
  params?: Record<string, any>
  
  /**
   * 错误上下文，指示验证失败的上下文信息
   */
  context?: ValidationErrorContext
}

export type ValidatorResult = ValidationRuleError | null
/**
 * 验证结果接口
 * 描述一次验证操作的整体结果
 */
export interface ValidationResult {
  /**
   * 验证是否通过的标志
   * true表示验证通过，false表示验证失败
   */
  valid: boolean
  
  /**
   * 验证错误列表，可选字段
   * 当valid为false时，包含具体的错误信息数组
   */
  errors?: ValidationRuleError[]
}

/**
 * 验证器函数类型定义
 * 通用的验证函数签名，可用于各种验证场景
 * 
 * @template T - 要验证的值的类型
 * @template R - 验证规则的类型
 * 
 * @param value - 需要验证的值
 * @param rule - 验证规则，可选参数
 * @param path - 验证路径，用于定位嵌套对象中的字段，可选参数
 * @returns 如果验证通过返回null，验证失败则返回ValidationError对象
 */
export type Validator<T = any, R = any> = (
  value: T,
  rule?: R,
  context?: ValidationErrorContext | string[]
) => ValidationRuleError | null