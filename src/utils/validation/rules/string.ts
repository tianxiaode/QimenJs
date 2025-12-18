import { IValidationRule } from "./types"

/**
 * 字符串验证规则接口
 * 定义了用于字符串类型数据验证的各种规则选项
 */
export interface StringRule extends IValidationRule {
  /**
   * 规则类型标识，固定为'string'，表明这是字符串验证规则
   */
  type: 'string'
  
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

export interface EmailRule extends IValidationRule {
    minLength?: number
    maxLength?: number  
    pattern?: RegExp  
}