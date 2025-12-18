/**
 * 验证错误信息接口
 * 用于描述单个验证错误的结构
 */
export interface ValidationError {
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
   * 错误路径，指示验证失败的数据位置
   * 可以是字符串或字符串数组形式的路径
   * 例如: 'user.name' 或 ['user', 'name']
   */
  path?: string | string[]
}

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
  errors?: ValidationError[]
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
  path?: string | string[]
) => ValidationError | null