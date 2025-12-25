import { CoreRuleOptions, RuleBaseOptions } from '../../core';

/**
 * 对象验证规则接口
 * 定义了用于对象类型数据验证的各种规则选项
 */
export interface ObjectRuleOptions extends CoreRuleOptions {
  /**
   * 枚举值验证
   * 对象必须是枚举数组中的某一个值
   */
  enum?: readonly object[];
}