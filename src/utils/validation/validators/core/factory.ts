import {
    ValidationResult,
    ValidationRuleError,
    normalizeValidationResult,
    ValidationErrorContext,
    CoreRule,
    CheckFunction,
    ExtensionRule,
} from '../../core';

/**
 * 工厂函数生成核心验证函数
 * @param validators 验证函数数组，每个函数签名为 (value, rule, context) => CheckResult
 * @param handleChildren 子元素验证函数，签名为 (value, rule, context) => ValidationResult
 */
export function createCoreValidator<R extends ExtensionRule = ExtensionRule>(
    validators: CheckFunction<R>[],
    handleChildren?: (value: any, rule: R, context: ValidationErrorContext) => ValidationResult
) {
    return function validateFn(
        value: any,
        rule: R,
        context: ValidationErrorContext = {}
    ): ValidationResult {
        let errors: ValidationRuleError[] = [];

        for (const validator of validators) {
            const error = validator(value, rule, context);
            if (error) {
                errors.push(error);
            }
        }

        if (handleChildren) {
            const childError = handleChildren(value, rule, context);
            if (childError) {
                errors = [...errors, ...childError];
            }
        }

        return normalizeValidationResult(errors);
    };
}
