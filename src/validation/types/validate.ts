import { IValidationError, ValidationContext } from './context';
import type {
    ArrayRule,
    BooleanRule,
    CompareRule,
    DateRule,
    FileRule,
    FormatRule,
    NumberRule,
    ObjectRule,
    PasswordRule,
    SplitRule,
    StringRule,
    ValidationRule,
} from '@qimenjs/schema';

/** 验证器注册表名称常量 */
export const ValidatorRegistrarName = 'validator' as const;

/** 验证结果接口 */
export interface ValidationResult {
    isValid: boolean;
    errors: IValidationError[];
    context: ValidationContext;
    value: any;
}

/** 统一验证函数签名类型 */
export type ValidateFunction = (
    value: any,
    rule: ValidationRule,
    context?: Partial<ValidationContext>
) => Promise<ValidationResult>;

/** 验证返回结果类型 */
export type ValidateResult = IValidationError[] | null;
