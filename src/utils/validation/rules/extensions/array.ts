import { ExtensionRule } from '../../core';
import { ArrayRuleOptions } from '../core';

export interface ArrayAdvanceRule<T = any> extends ExtensionRule, Omit<ArrayRuleOptions, 'type'> {
    type: 'arrayEx';
    
    /** 是否允许空数组 */
    allowEmpty?: boolean;

    /** 集合约束 */
    unique?: boolean;
    uniqueBy?: string | ((item: T) => any);

    contains?: readonly T[];
    minContains?: number;
    maxContains?: number;

    /** 关系约束 */
    //   some?: ValidationRuleBase;
    //   every?: ValidationRuleBase;
    //   none?: ValidationRuleBase;

    /** 排序约束 */
    sorted?: 'asc' | 'desc' | ((a: T, b: T) => number);
}
