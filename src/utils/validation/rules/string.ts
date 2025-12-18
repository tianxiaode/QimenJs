
/**
 * 字符串验证规则接口
 * 定义了用于字符串类型数据验证的各种规则选项
 */
export interface StringRule {
  /**
   * 规则类型标识，固定为'string'，表明这是字符串验证规则
   */
  type: 'string'
  
  /**
   * 是否必填验证
   * true: 值不能为空或undefined
   * false或未定义: 值可以为空
   */
  required?: boolean
  
  /**
   * 是否允许为空值(null)
   * true: 允许值为null
   * false或未定义: 不允许值为null
   */
  nullable?: boolean
  
  /**
   * 最小长度限制
   * 字符串长度不能少于指定数值
   */
  minLength?: number
  
  /**
   * 最大长度限制
   * 字符串长度不能超过指定数值
   */
  maxLength?: number
  
  /**
   * 精确长度限制
   * 字符串长度必须等于指定数值
   * 如果设置了此属性，minLength和maxLength将被忽略
   */
  exactLength?: number
  
  /**
   * 正则表达式模式匹配
   * 字符串必须匹配指定的正则表达式模式
   */
  pattern?: RegExp
  
  /**
   * 枚举值验证
   * 字符串必须是枚举数组中的某一个值
   */
  enum?: readonly string[]
}