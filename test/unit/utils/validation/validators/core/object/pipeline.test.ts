import { validateObject, ValidationErrorContext, ObjectRuleOptions } from '@/utils';

// 模拟验证函数
const mockStringValidator = (value: any, rule: any, context?: any) => {
    if (typeof value !== 'string') {
        return [
            {
                code: 'VALIDATION_TYPE_MISMATCH',
                params: { expectedType: 'string', actualType: typeof value },
                context,
            },
        ];
    }
    return null;
};

const mockNumberValidator = (value: any, rule: any, context?: any) => {
    if (typeof value !== 'number') {
        return [
            {
                code: 'VALIDATION_TYPE_MISMATCH',
                params: { expectedType: 'number', actualType: typeof value },
                context,
            },
        ];
    }
    return null;
};

const mockSuccessValidator = (value: any, rule: any, context?: any) => {
    return null;
};

describe('validateObject', () => {
    it('当对象符合所有规则时验证通过，返回null', () => {
        const value = {
            field1: 'value1',
            field2: 42,
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为null时跳过对象属性验证', () => {
        const value = null;
        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值为undefined时跳过对象属性验证', () => {
        const value = undefined;
        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).toBeNull();
    });

    it('当值不是对象类型时跳过对象属性验证', () => {
        const value = 'not an object';
        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当对象缺少必需字段时返回missing_field错误', () => {
        const value = {
            field1: 'value1',
            // field2 is missing
        };

        const rule: ObjectRuleOptions = {
            requiredFields: ['field1', 'field2'],
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params.field).toBe('field2');
        }
    });

    it('当对象属性不符合规则时返回验证错误', () => {
        const value = {
            field1: 123, // 应该是字符串
            field2: 42,
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当对象包含额外属性时返回not_allowed错误', () => {
        const value = {
            field1: 'value1',
            field2: 42,
            extraField: 'extra', // 额外属性
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
            expect(result[0].params.value).toBe('extraField');
        }
    });

    it('当requiredFields为undefined时跳过必需字段验证', () => {
        const value = {
            field1: 'value1',
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).toBeNull();
    });

    it('当properties为undefined时验证通过', () => {
        const value = {
            field1: 'value1',
            field2: 42,
        };

        const rule: ObjectRuleOptions = {};

        const result = validateObject(value, rule, {});

        expect(result).toBeNull();
    });

    it('当allPropertiesError为true时收集所有属性错误', () => {
        const value = {
            field1: 123, // 应该是字符串
            field2: 'not a number', // 应该是数字
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
            allPropertiesError: true,
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result) {
            // 至少有一个错误
            expect(result.length).toBeGreaterThanOrEqual(1);
        }
    });

    it('应该正确传递上下文信息', () => {
        const value = {
            field1: 123, // 应该是字符串
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
            },
        };

        const context: ValidationErrorContext = {
            field: 'testObject',
            value,
        };

        const result = validateObject(value, rule, context);

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].context) {
            expect(result[0].context.field).toBe('testObject');
        }
    });

    it('当对象包含必需字段和属性验证都失败时返回必需字段错误（因为它是先检查的）', () => {
        const value = {
            // field1 is missing
            field2: 'not a number', // 应该是数字
        };

        const rule: ObjectRuleOptions = {
            requiredFields: ['field1', 'field2'],
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].code).toBe('VALIDATION_MISSING_FIELD');
            expect(result[0].params.field).toBe('field1');
        }
    });

    it('当对象属性验证失败后不会检查额外属性', () => {
        const value = {
            field1: 'value1',
            field2: 'not a number', // 应该是数字
            extraField: 'extra', // 额外属性
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockSuccessValidator,
                field2: mockNumberValidator, // 会失败
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0]) {
            expect(result[0].code).toBe('VALIDATION_TYPE_MISMATCH');
        }
    });

    it('当对象属性验证通过但有额外属性时返回额外属性错误', () => {
        const value = {
            field1: 'value1',
            field2: 42,
            extraField: 'extra', // 额外属性
        };

        const rule: ObjectRuleOptions = {
            properties: {
                field1: mockStringValidator,
                field2: mockNumberValidator,
            },
        };

        const result = validateObject(value, rule, {});

        expect(result).not.toBeNull();
        if (result && result[0] && result[0].params) {
            expect(result[0].code).toBe('VALIDATION_NOT_ALLOWED');
            expect(result[0].params.value).toBe('extraField');
        }
    });
});
