import { CommonRule, ValidationErrorContext } from '../../core';
import { CompareOperator } from '../../validators';

export interface CompareRule<T = unknown> extends CommonRule {
    type: 'compare';
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
    target: T | ((ctx?: ValidationErrorContext) => T);

    /**
     * 是否严格比较
     * true: strictCompare
     * false: looseCompare
     */
    strict?: boolean;
}
