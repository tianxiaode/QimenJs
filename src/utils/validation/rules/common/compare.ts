import { RuleBaseOptions, ValidationErrorContext } from '../../core';

export type CompareOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';

export interface CompareRuleOptions extends RuleBaseOptions {
    /**
     * 比较操作符
     */
    operator: CompareOperator;

    /**
     * 被比较的目标值
     * - 固定值
     * - 字段路径
     * - 函数（高级用法）
     */
    target: unknown | ((ctx?: ValidationErrorContext) => unknown);

    /**
     * 是否严格比较
     * true: strictCompare
     * false: looseCompare
     */
    strict?: boolean;
}


