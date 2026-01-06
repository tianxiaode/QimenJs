import { validate, ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler, ValidationWeight } from '../../types';

// 定义字符串is验证的谓词函数类型
type StringIsPredicate = (value: string) => { isValid: boolean; expectedType: string };

// 字符串is验证谓词映射对象 - 只定义需要验证的类型
const stringIsPredicates: Record<string, StringIsPredicate> = {
    // 验证是否为有效的JSON字符串
    json: (value: string) => {
        try {
            JSON.parse(value);
            return { isValid: true, expectedType: 'valid JSON string' };
        } catch (e) {
            return { isValid: false, expectedType: 'valid JSON string' };
        }
    },
    
    // 验证是否为有效的Base64字符串
    base64: (value: string) => {
        const base64Regex = /^[A-Za-z0-9+/]*={0,3}$/;
        const isValid = base64Regex.test(value) && value.length > 0;
        return { isValid, expectedType: 'valid base64 string' };
    },
    
    // 验证是否为有效的十六进制字符串
    hex: (value: string) => {
        const hexRegex = /^[0-9A-Fa-f]+$/;
        const isValid = hexRegex.test(value);
        return { isValid, expectedType: 'valid hexadecimal string' };
    },
};

export const StringIsProcessor: ValidationProcessorHandler = async (context) => {
    const { value, rule, path } = context;

    // 如果值不是字符串或没有is规则，跳过处理
    if (typeof value !== 'string' || !rule.is) return;

    // 获取对应的验证函数
    const validator = stringIsPredicates[rule.is];
    
    if (!validator) {
        // 如果没有找到对应的验证器，跳过处理
        return;
    }

    // 执行验证
    const { isValid, expectedType } = validator(value);

    if (!isValid) {
        context.errors.push(ValidationErrorBuilder.invalid_value(value, {
            ...context,
            expected: expectedType
        }));
    }
};

ValidationRegistry.register({
    name: 'string.is',
    tags: ['string'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: StringIsProcessor,
});