/**
 * 布尔值验证规则
 */
export interface BooleanRule {
  type: 'boolean'

  /** 是否必填 */
  required?: boolean

  /** 是否允许为 null */
  nullable?: boolean

  /**
   * 枚举限制
   * 例如：只能为 true
   */
  enum?: readonly boolean[]
}
