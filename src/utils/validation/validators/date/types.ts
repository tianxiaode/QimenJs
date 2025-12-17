import { ValidationResult } from '../../core'

/**
 * 布尔验证规则接口
 */
export interface DateValidationRules {
    required?: boolean;
    min?: Date;
    max?: Date;
    future?: boolean;
    past?: boolean;
    custom?: (value: Date) => ValidationResult;
}
