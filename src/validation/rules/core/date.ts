import { CoreRuleOptions, RuleBaseOptions, RuleRangeOptions } from '../../core';

/**
 * 日期验证规则接口
 */
export interface DateRuleOptions extends CoreRuleOptions,RuleRangeOptions<Date> {
  /** 允许的日期列表 */
  includes?: Date[] | ((rule: DateRuleOptions) => Date[]);
  /** 排除的日期列表 */
  excludes?: Date[] | ((rule: DateRuleOptions) => Date[]);
}