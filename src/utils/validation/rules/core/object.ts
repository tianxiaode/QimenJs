import { HasPropertiesRule } from '../../core';

/**
 * 对象验证规则接口
 */
export interface ObjectRule extends HasPropertiesRule {
    type: 'object';
}
