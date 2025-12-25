import { CoreRuleOptions, RuleArrayItemsOptions, RuleLengthOptions } from '../../core';

/**
 * 数组验证规则接口
 */
export interface ArrayRuleOptions extends CoreRuleOptions, RuleArrayItemsOptions, RuleLengthOptions {

    /**
     * 是否允许空数组
     * 默认 true
     */
    allowEmpty?: boolean;

    /**
     * 枚举（整个数组作为一个值）
     * 很少用，但 schema 里是合法的
     */
    enum?: readonly any[][];
}
