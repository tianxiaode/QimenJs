import {
    ValidationResult,
    ValidationRuleError,
    ValidationErrorBuilder,
    ValidationErrorContext,
    CheckFunction,
} from '../../core';

/**
 * 工厂函数生成核心验证函数
 * @param validators 验证函数数组，每个函数签名为 (value, rule, context) => CheckResult
 * @param handleChildren 子元素验证函数，签名为 (value, rule, context) => ValidationResult
 * @returns 返回一个验证函数，该函数会对值进行一系列验证并将结果标准化
 */
export function createCoreValidator(
    validators: CheckFunction[],
    handleChildren?: (value: any, rule: any, context: ValidationErrorContext) => ValidationResult
) {
    /**
     * 核心验证函数
     * @param value - 需要验证的值
     * @param rule - 验证规则对象
     * @param context - 验证上下文，包含路径和其他元数据
     * @returns 验证结果，null表示验证通过，数组表示验证错误
     */
    return function validateFn(
        value: any,
        rule: any,
        context: ValidationErrorContext = {}
    ): ValidationResult {
        // 存储所有验证过程中产生的错误
        let errors: ValidationRuleError[] = [];

        // 顺序执行所有基础验证器
        for (const validator of validators) {
            const error = validator(value, rule, context);
            // 如果某个验证器返回错误，则将其添加到错误列表中
            // 注意：这里不会因为一个验证失败而中断后续验证
            if (error) {
                errors.push(error);
            }
        }

        // 如果提供了处理子元素的验证函数，则执行子元素验证
        if (handleChildren) {
            const childError = handleChildren(value, rule, context);
            // 将子元素验证的错误合并到主错误列表中
            if (childError) {
                errors = [...errors, ...childError];
            }
        }

        // 标准化验证结果：如果有错误则返回错误数组，无错误则返回null
        return ValidationErrorBuilder.normalizeResult(errors);
    };
}