import { CoreRule } from '../../core';

/**
 * 日期验证规则接口
 */
export interface DateRule extends CoreRule {
    type: 'date';

    /** 最小日期（含） */
    min?: Date;

    /** 最大日期（含） */
    max?: Date;
}
