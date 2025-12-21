import { CoreRuleOptions, RuleLengthOptions } from '../../core';

/**
 * 字符串验证规则接口
 * 定义了用于字符串类型数据验证的各种规则选项
 */
export interface StringRuleOptions extends CoreRuleOptions, RuleLengthOptions {

    /**
     * 正则表达式模式匹配
     * 字符串必须匹配指定的正则表达式模式
     */
    pattern?: RegExp;

    /**
     * 枚举值验证
     * 字符串必须是枚举数组中的某一个值
     */
    enum?: readonly string[];
}

