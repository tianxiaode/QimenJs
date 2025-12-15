import {
    ValidationResult,
    NumberValidationRules,
    createValidationSuccess,
    createValidationFailure,
} from '../base';
import { isNumber, isInteger, isRequired } from '../primitives';
import { hasMinValue, hasMaxValue } from '../constraints';
import { allRules } from '../composition';

/**
 * 构建数字验证器
 * @param rules 数字验证规则配置
 * @returns 验证函数
 */
export function buildNumberValidator(
    rules: NumberValidationRules
): (value: number) => ValidationResult {
    return (value: number): ValidationResult => {
        // 1. 类型检查
        const numberCheck = isNumber(value);
        if (!numberCheck.isValid) {
            return numberCheck;
        }

        // 2. 如果值为空且不是必填，直接通过
        if ((value === null || value === undefined) && !rules.required) {
            return createValidationSuccess();
        }

        // 3. 构建验证规则数组
        const validators: Array<(value: number) => ValidationResult> = [];

        // 4. 添加规则（由于第2步已经处理了非必填的空值情况，这里可以简化）
        if (rules.required) {
            validators.push(isRequired);
        }

        // 只有在值不为空时才添加这些规则
        if (value !== null && value !== undefined) {
            if (rules.min !== undefined) validators.push(hasMinValue(rules.min, true));
            if (rules.max !== undefined) validators.push(hasMaxValue(rules.max, true));
            if (rules.integer) validators.push(isInteger);
            if (rules.positive) validators.push(hasMinValue(0, false));
            if (rules.negative) validators.push(hasMaxValue(0, false));
            if (rules.custom) validators.push(rules.custom);
        }

        // 5. 执行验证
        return validators.length > 0 ? allRules(...validators)(value) : createValidationSuccess();
    };
}
