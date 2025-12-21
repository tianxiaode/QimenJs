import { CoreRuleOptions, RuleBaseOptions, RuleRangeOptions } from '../../core';

/**
 * 数字验证规则接口
 */
export interface NumberRuleOptions extends CoreRuleOptions, RuleRangeOptions<number> {

    /** 最小值（不包含） */
    exclusiveMin?: number;

    /** 最大值（不包含） */
    exclusiveMax?: number;

    /** 是否必须为整数 */
    integer?: boolean;

    /** 枚举值限制 */
    enum?: readonly number[];
}
