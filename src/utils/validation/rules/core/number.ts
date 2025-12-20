import { CoreRule } from '../../core';

/**
 * 数字验证规则接口
 */
export interface NumberRule extends CoreRule {
    type: 'number';

    /** 最小值（包含） */
    min?: number;

    /** 最大值（包含） */
    max?: number;

    /** 最小值（不包含） */
    exclusiveMin?: number;

    /** 最大值（不包含） */
    exclusiveMax?: number;

    /** 是否必须为整数 */
    integer?: boolean;

    /** 枚举值限制 */
    enum?: readonly number[];
}
