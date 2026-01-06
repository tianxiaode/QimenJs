import { ValidationContext } from "./context";
import { ValidationRule } from "./rule";

// 统一的验证函数签名
export type ValidateFunction = (
    value: any, 
    rule: ValidationRule, 
    context?: Partial<ValidationContext>
) => Promise<ValidationContext>;