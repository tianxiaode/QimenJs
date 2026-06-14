import { ValidationContext, ValidationRule } from '../types';
import { ValidateFunction } from '../types/validate';
/**
 * 上下文构造工厂
 */
export declare function createContext(value: any, rule: ValidationRule, partial?: Partial<ValidationContext>): ValidationContext;
/**
 * 验证函数
 *
 * @description 使用统一的 pipeline 执行器
 *
 * @param value 要验证的值
 * @param rule 验证规则
 * @param partialContext 部分上下文（可选）
 * @returns 验证结果
 */
export declare const doValidate: ValidateFunction;
//# sourceMappingURL=validate.d.ts.map