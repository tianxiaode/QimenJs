import { RuleBaseOptions } from '../../core';
import { DateRuleOptions } from '../core';

/**
 * 日期格式验证规则选项
 * 用于验证日期字符串是否符合指定格式
 */
export interface DateFormatRuleOptions extends DateRuleOptions {
  /**
   * 期望的日期格式
   * 如 'YYYY-MM-DD', 'MM/DD/YYYY' 等
   */
  format?: string;
}

/**
 * 日期必需验证规则选项
 * 忽略 required、nullable 和 empty 选项，因为扩展规则通常在值存在时才验证
 */
export interface DateRequiredRuleOptions extends Omit<
  DateFormatRuleOptions,
  'required' | 'nullable' | 'empty'
> {}

export interface WeekendRuleOptions extends DateRequiredRuleOptions {
    weekend: number | number[];
}
