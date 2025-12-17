import { ValidationResult } from '../../core'

/**
 * 数组验证规则接口
 * 
 * 注意：
 * - 数组元素的验证规则是通过 `items` 属性来实现的，而不是直接在数组规则中定义。
 * - 数组元素的验证规则可以是一个函数，也可以是一个对象。
 * - 如果数组元素的验证规则是一个函数，则该函数接收数组元素作为参数，返回一个验证结果。
 * - 如果数组元素的验证规则是一个对象，则该对象可以包含多个验证规则。
 * - 数组元素的验证规则可以是复合规则，也可以是单一规则。
 */
export interface ArrayValidationRules {
  /**
   * 存在性控制：
   * - undefined/null: 允许不存在（默认）
   * - false: 允许不存在
   * - true: 必须存在，但可以为空数组 []
   * - 'non-empty': 必须存在且不能为空数组
   */    
  required?: boolean | 'non-empty';
  minLength?: number;
  maxLength?: number;
  exactLength?: number;
  unique?: boolean;
  uniqueBy?: (item: any) => any;
  
  /**
   * 验证数组的每个元素
   * @example
   * // 验证每个元素是字符串
   * items: (item) => validateString(item, { minLength: 2 })
   * 
   * // 验证每个元素是特定结构的对象
   * items: (item) => validateObject(item, {
   *   name: { type: 'string', required: true },
   *   age: { type: 'number', min: 0 }
   * })
   */
  items?: (item: any) => ValidationResult;
  
  /**
   * 至少一个元素满足条件
   */
  some?: (item: any) => ValidationResult;
  
  includes?: any;
  excludes?: any;
  sorted?: boolean;
  sortedBy?: (a: any, b: any) => number;
  matches?: (value: any[]) => boolean;
  custom?: (value: any[]) => ValidationResult;
}
