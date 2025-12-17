import { ValidationResult } from '../../core'


/**
 * 对象验证规则接口
 */
export interface ObjectValidationRules {
    required?: boolean;
    minKeys?: number;
    maxKeys?: number;
    allowedKeys?: string[];
    disallowedKeys?: string[];
    custom?: (value: object) => ValidationResult;
}
