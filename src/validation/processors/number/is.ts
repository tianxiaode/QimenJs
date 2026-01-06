import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import { ValidationProcessorHandler, ValidationWeight } from '../../types';

// 定义数字is验证的谓词函数类型
type NumberIsPredicate = (value: number) => { isValid: boolean; expectedType: string };

// 数字is验证谓词映射对象 - 只定义需要验证的类型
const numberIsPredicates: Record<string, NumberIsPredicate> = {
    // 验证是否为整数
    integer: (value: number) => ({
        isValid: Number.isInteger(value),
        expectedType: 'integer'
    }),
    
    // 验证是否为浮点数（非整数的有限数）
    float: (value: number) => ({
        isValid: !Number.isInteger(value) && !Number.isNaN(value) && Number.isFinite(value),
        expectedType: 'float (non-integer number)'
    }),
    
    // 验证是否为偶数
    even: (value: number) => ({
        isValid: Number.isInteger(value) && value % 2 === 0,
        expectedType: 'even number'
    }),
    
    // 验证是否为奇数
    odd: (value: number) => ({
        isValid: Number.isInteger(value) && value % 2 !== 0,
        expectedType: 'odd number'
    }),
    
    // 验证是否为无限数
    infinite: (value: number) => ({
        isValid: !Number.isFinite(value),
        expectedType: 'infinite number'
    }),
    
    // 验证是否为NaN
    nan: (value: number) => ({
        isValid: Number.isNaN(value),
        expectedType: 'NaN value'
    }),
};

export const NumberIsProcessor: ValidationProcessorHandler = async (context) => {
    const { value, rule, path } = context;

    // 如果值不是数字或没有is规则，跳过处理
    if (typeof value !== 'number' || !rule.is) return;

    // 获取对应的验证函数
    const validator = numberIsPredicates[rule.is];
    
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
    name: 'number.is',
    tags: ['number'],
    weight: ValidationWeight.SEMANTIC,
    offset: 100,
    execute: NumberIsProcessor,
});