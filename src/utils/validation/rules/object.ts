/**
 * 对象验证规则接口
 */
export interface ObjectRule {
  type: 'object'

  /** 是否必填（不允许 undefined） */
  required?: boolean

  /** 是否允许为 null */
  nullable?: boolean

  /**
   * 字段规则定义
   * key -> rule
   */
  properties?: Record<string, any>

  /**
   * 必须存在的字段列表
   */
  requiredFields?: readonly string[]

  /**
   * 是否允许未定义规则的字段
   * 默认 true
   */
  additionalProperties?: boolean
}
