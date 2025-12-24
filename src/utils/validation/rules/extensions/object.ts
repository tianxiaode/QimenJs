import { RuleBaseOptions } from '../../core';
import { ObjectRuleOptions } from '../core';

/**
 * 对象键验证规则选项
 * 用于验证对象的键是否符合指定规则
 */
export interface ObjectKeysRuleOptions extends ObjectRuleOptions {
  /**
   * 允许的键列表
   * 如果指定，对象的键必须是此列表中的值
   */
  allowKeys?: string[];

  /**
   * 禁止的键列表
   * 如果指定，对象的键不能包含此列表中的任何值
   */
  denyKeys?: string[];
}

/**
 * 对象必需验证规则选项
 * 忽略 required、nullable 和 empty 选项，因为扩展规则通常在值存在时才验证
 */
export interface ObjectRequiredRuleOptions extends Omit<
  ObjectKeysRuleOptions,
  'required' | 'nullable' | 'empty'
> {}