import { CoreRuleOptions, RuleBaseOptions, RuleRangeOptions } from '../../core';

/**
 * 日期验证规则接口
 */
export interface DateRuleOptions extends CoreRuleOptions,RuleRangeOptions<Date> {}
