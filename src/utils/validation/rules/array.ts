/**
 * 数组验证规则接口
 */
export interface ArrayRule {
  type: 'array'

  /** 是否必填（不允许 undefined） */
  required?: boolean

  /** 是否允许为 null */
  nullable?: boolean

  /** 最小长度 */
  minLength?: number

  /** 最大长度 */
  maxLength?: number

  /** 精确长度 */
  exactLength?: number

  /**
   * 元素规则
   * 用于验证数组中每一个元素
   */
  items?: any   // ⚠️ 这里是 rule，由 engine 再分发

  /**
   * 是否允许空数组
   * 默认 true
   */
  allowEmpty?: boolean

  /**
   * 枚举（整个数组作为一个值）
   * 很少用，但 schema 里是合法的
   */
  enum?: readonly any[][]
}
