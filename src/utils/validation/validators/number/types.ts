import { ValidationResult } from '../../core'

/**
 * 数值验证规则接口
 */
export interface NumberValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
    negative?: boolean;
    custom?: (value: number) => ValidationResult;
}
