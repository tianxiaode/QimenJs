import {
    ValidationResult,
    ValidationRuleError,
    ValidationErrorBuilder,
    ValidationErrorContext,
    CheckFunction,
} from '../../core';

/**
 * 将验证规则设置为必需且不可为空，可选择是否允许空值
 *
 * @template T 验证规则类型
 * @param rule 验证规则对象
 * @param allowEmpty 是否允许空值，默认为false
 * @returns 设置了 required: true, nullable: false 的新规则对象，以及根据allowEmpty参数设置的empty字段
 */
export function enforceRuleRequirement<T extends Record<string, any>>(
    rule: T,
    allowEmpty: boolean = false
): T {
    const newRule: any = { ...rule, required: true, nullable: false };
    if (allowEmpty) {
        newRule.empty = allowEmpty;
    }
    return newRule;
}

/**
 * 预处理验证规则函数
 * 根据特定条件自动设置 required 和 nullable 属性
 *
 * @template T 验证规则类型
 * @param rule 验证规则对象
 * @param requiresValueCheck 检查是否需要值存在的函数
 * @returns 处理后的验证规则对象
 */
export function preprocessRequiredRule<T extends Record<string, any>>(
    rule: T,
    requiresValueCheck: (rule: T) => boolean
): T {
    const needsValue = requiresValueCheck(rule);

    if (needsValue) {
        return enforceRuleRequirement(rule);
    }
    return rule;
}

/**
 * 工厂函数生成核心验证函数
 * @param preProcessRule 前置处理函数，签名为 (rule) => rule，用于根据规则调整参数
 * @param gates 验证门函数数组，这些验证器检查值的基本条件（如存在性、类型等），如果任一门验证返回特定错误码，则后续验证器不执行
 * @param validators 验证函数数组，每个函数签名为 (value, rule, context) => CheckResult
 * @param handleChildren 子元素验证函数，签名为 (value, rule, context) => ValidationResult
 * @returns 返回一个验证函数，该函数会对值进行一系列验证并将结果标准化
 */
export function createCoreValidator(
    preProcessRule: (rule: any) => any,
    gates: CheckFunction[],
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
        // 如果有前置处理函数，先处理规则
        let processedRule = rule;
        if (preProcessRule) {
            processedRule = preProcessRule(rule);
        }

        // 存储所有验证过程中产生的错误
        let errors: ValidationRuleError[] = [];

        // 首先执行所有gates验证器
        for (const gate of gates) {
            const error = gate(value, processedRule, context);
            if (error) {
                return [error]; // 对于任何一个gate验证器返回错误，立即返回
            }
        }

        // gates验证通过后，执行所有业务验证器
        for (const validator of validators) {
            const error = validator(value, processedRule, context);
            if (error) {
                errors.push(error);
            }
        }

        // 如果提供了处理子元素的验证函数，则执行子元素验证
        if (handleChildren) {
            const childError = handleChildren(value, processedRule, context);
            // 将子元素验证的错误合并到主错误列表中
            if (childError) {
                errors = [...errors, ...childError];
            }
        }

        // 标准化验证结果：如果有错误则返回错误数组，无错误则返回null
        return ValidationErrorBuilder.normalizeResult(errors);
    };
}
