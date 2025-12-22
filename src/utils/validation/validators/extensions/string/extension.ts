import { ValidationErrorBuilder, ValidationErrorContext, ValidationResult, Validator } from '../../../core';
import { StringExtensionRuleOptions } from '../../../rules';
import { validatePresence } from '../../common';
import { validateString } from '../../core';

/**
 * 高级字符串验证函数
 * 提供比基础字符串验证更多的功能，包括预处理和高级验证规则
 * @param value - 待验证的值
 * @param rule - 字符串高级验证规则
 * @param context - 验证上下文信息
 * @returns 验证结果，验证通过返回null，验证失败返回错误信息数组
 */
export function validateStringExtension(
    value: any,
    rule: StringExtensionRuleOptions,
    context: ValidationErrorContext = {}
): ValidationResult {
    // 1️⃣ presence 校验：检查必填项和存在性
    const presenceResult = validatePresence(value, rule, context);
    if (presenceResult) {
        return presenceResult;
    }

    // 2️⃣ nullable / optional：如果值为null或undefined且允许为空，则直接通过验证
    if (value === null || value === undefined) {
        return null;
    }

    // 3️⃣ 类型校验：确保值为字符串类型
    if (typeof value !== 'string') {
        return [ValidationErrorBuilder.type_mismatch('string', typeof value, context)];
    }

    // 4️⃣ 预处理（transform）：根据规则对字符串进行预处理
    let str = value;

    // trim: 去除首尾空白字符
    if (rule.trim) str = str.trim();
    // trimInner: 去除内部所有空白字符
    if (rule.trimInner) str = str.replace(/\s+/g, '');
    // trimNewline: 去除换行符
    if (rule.trimNewline) str = str.replace(/[\r\n]+/g, '');

    // 5️⃣ 完整字符串校验：使用基础字符串验证器进行详细验证
    return validateString(str, rule, context);
}

// 注册高级字符串验证器到验证器基础类中
Validator.registerValidator('stringEx', validateStringExtension);