import { IValidationError, ValidationContext } from "./context";
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
    ValidationRule 
} from "@qimenjs/schema";


export const ValidatorRegistrarName= 'validator' as const;

export interface ValidationResult {
    isValid: boolean;
    errors: IValidationError[];
    context: ValidationContext;
    value: any;
}

// 统一的验证函数签名
export type ValidateFunction = (
    value: any, 
    rule: ValidationRule, 
    context?: Partial<ValidationContext>
) => Promise<ValidationResult>;

export type ValidateResult = IValidationError[] | null;

