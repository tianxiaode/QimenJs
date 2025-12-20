import { HasChildRule } from '../../core';

/**
 * 数组验证规则接口
 */
export interface ArrayRule extends HasChildRule {
    type: 'array';

    /** 最小长度 */
    minLength?: number;

    /** 最大长度 */
    maxLength?: number;

    /** 精确长度 */
    exactLength?: number;

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
