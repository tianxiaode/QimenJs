import { NumberRuleOptions } from '../core';

/**
 * 数字必需验证规则选项
 * 忽略 required、nullable 和 empty 选项，因为扩展规则通常在值存在时才验证
 */
export interface NumberRequiredRuleOptions extends Omit<
  NumberRuleOptions,
  'required' | 'nullable' | 'empty'
> {}

/**
 * 数字扩展规则接口
 * 提供了更详细的数字验证选项
 */
export interface NumberExtensionRule extends NumberRequiredRuleOptions {
    /**
     * 正数验证
     * 如果为 true，则验证数字必须为正数（大于0）
     */
    positive?: boolean;
    
    /**
     * 负数验证
     * 如果为 true，则验证数字必须为负数（小于0）
     */
    negative?: boolean;
    
    /**
     * 奇数验证
     * 如果为 true，则验证数字必须为奇数
     */
    odd?: boolean;
    
    /**
     * 偶数验证
     * 如果为 true，则验证数字必须为偶数
     */
    even?: boolean;
    
    /**
     * 有限数验证
     * 如果为 true，则验证数字必须为有限数（非 Infinity 和 -Infinity）
     */
    finite?: boolean;
    
    /**
     * 无限数验证
     * 如果为 true，则验证数字必须为无限数（Infinity 或 -Infinity）
     */
    infinite?: boolean;

    /**
     * 允许的值列表
     * 指定允许的数字值数组，只有在此列表中的数字才通过验证
     */
    allowsValues?: readonly number[];
    
    /**
     * 禁止的值列表
     * 指定禁止的数字值数组，不在此列表中的数字才通过验证
     */
    disallowsValues?: readonly number[];
}