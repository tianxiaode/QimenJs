import { ValidationResult } from '../../core'

/**
 * 布尔验证规则接口
 */
export interface BooleanValidationRules {
    required?: boolean;
    custom?: (value: boolean) => ValidationResult;
}
