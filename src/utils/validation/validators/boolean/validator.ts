import { BooleanValidationOptions } from './types';
import {
    ValidationErrorCode,
    ValidationResult,
    createValidationSuccess,
    createValidationFailure,
    assertValidation,
} from '../../core';
import { allRules } from '../../composition';
import {
    getRuleFunctions,
    isFunction
} from '../../rules';


/**
 * 验证布尔值
 * @param value 要验证的值
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateBoolean(
    value: any,
    options: BooleanValidationOptions = {}
): ValidationResult {
    const defaultOptions: BooleanValidationOptions = {
        required: false,
        nullable: false,
        coerce: false,
        strict: false,
        truthyValues: [true, 1, 'true', '1'],
        falsyValues: [false, 0, 'false', '0', ''],
        ...options,
    };

    // 1. 空值处理
    if (value == null) {
        if (defaultOptions.nullable) {
            return createValidationSuccess();
        }
        if (defaultOptions.required) {
            return createValidationFailure(ValidationErrorCode.REQUIRED, {
                value,
                options: defaultOptions,
            });
        }
        return createValidationSuccess();
    }

    let booleanValue: boolean;

    // 2. 类型转换和验证
    if (typeof value === 'boolean') {
        booleanValue = value;
    } else if (defaultOptions.coerce) {
        // 尝试转换为布尔值
        if (defaultOptions.truthyValues?.includes(value)) {
            booleanValue = true;
        } else if (defaultOptions.falsyValues?.includes(value)) {
            booleanValue = false;
        } else {
            return createValidationFailure(ValidationErrorCode.TYPE_NOT_BOOLEAN, {
                value,
                options: defaultOptions,
            });
        }
    } else if (defaultOptions.strict) {
        // 严格模式下必须是布尔类型
        return createValidationFailure(ValidationErrorCode.TYPE_NOT_BOOLEAN, {
            value,
            options: defaultOptions,
        });
    } else {
        // 非严格模式下的默认行为
        booleanValue = !!value;
    }

    // 3. 检查允许的值
    if (defaultOptions.allowedValues && !defaultOptions.allowedValues.includes(booleanValue)) {
        return createValidationFailure(ValidationErrorCode.NOT_IN_ALLOWED_VALUES, {
            value: booleanValue,
            options: defaultOptions,
        });
    }

    // 4. 获取所有验证规则函数（自动排除非规则键）
    const rules = getRuleFunctions(defaultOptions);

    // 5. 添加自定义验证（custom 不会被 getRuleFunctions 包含）
    if (isFunction(defaultOptions.custom).isValid) {
        rules.push(defaultOptions.custom!);
    }

    // 6. 执行所有验证规则
    return rules.length > 0 ? allRules(...rules)(booleanValue) : createValidationSuccess();
}
/**
 * 断言数字
 * @param value 要验证的值
 * @param rules 验证规则
 * @param context 验证上下文
 * @returns
 */
export function assertBoolean(
    value: any,
    rules: BooleanValidationOptions,
    context?: Record<string, any>
): any {
    const result = validateBoolean(value, rules);
    assertValidation(result, context);

    return value; // 返回原始值，便于链式调用
}
